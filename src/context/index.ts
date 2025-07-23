import http from 'node:http';
import querystring from 'node:querystring';
import type { Context, AppConfig, Request } from '../types';
import { GamanHeaders } from '../headers';
import { GamanCookies } from './cookies';
import { HTTP_REQUEST_SYMBOL, HTTP_RESPONSE_SYMBOL } from '../symbol';
import { GamanSession } from './session';
import { GamanBase } from '../gaman-base';
import { parseMultipart } from '@mjackson/multipart-parser/node';
import { Buffer } from 'node:buffer';
import { FormData, FormDataEntryValue, IFormDataEntryValue } from './formdata';
import { File } from './formdata/file';
import { Response } from '../response';

export async function createContext<A extends AppConfig>(
	app: GamanBase<A>,
	req: http.IncomingMessage,
	res: http.ServerResponse,
): Promise<Context<A>> {
	const urlString = req.url || '/';
	const method = req.method || 'GET';
	const url = new URL(urlString, `http://${req.headers.host}`);
	const contentType = req.headers['content-type'] || '';
	const headers = new GamanHeaders(req.headers);

	/** FormData state */
	let form: FormData | null = null;
	let body: Buffer;

	const gamanRequest: Request = {
		method,
		url: url.href,
		pathname: url.pathname,

		header: (key: string) => headers.get(key),
		headers: headers,

		param: (name) => {
			return gamanRequest.params[name];
		},
		params: {}, // akan di set dari router
		// body akan menjadi raw buffer untuk non-multipart, atau null/undefined untuk multipart

		query: createQuery(url.searchParams),

		body: async () => {
			if (body == null) {
				body = await getBody(req);
			}
			return body;
		},
		text: async () => {
			if (body == null) {
				body = await getBody(req);
			}
			return body.toString();
		},
		json: async <T>() => {
			if (contentType.includes('application/json') && method !== 'HEAD') {
				if (body == null) {
					body = await getBody(req);
				}
				try {
					return JSON.parse(body.toString()) as T;
				} catch {
					return {} as T;
				}
			} else if (contentType.includes('application/x-www-form-urlencoded') && method !== 'HEAD') {
				if (body == null) {
					body = await getBody(req);
				}
				return querystring.parse(body.toString()) as T;
			} else {
				return {} as T;
			}
		},
		formData: async () => {
			if (form !== null) {
				return form;
			}

			if (contentType.includes('application/x-www-form-urlencoded') && method !== 'HEAD') {
				if (body == null) {
					body = await getBody(req);
				}
				form = parseFormUrlEncoded(body.toString() || '{}');
			} else if (contentType.includes('multipart/form-data') && method !== 'HEAD') {
				if (body == null) {
					body = await getBody(req);
				}
				form = await parseMultipartForm(body, contentType);
			} else {
				form = new FormData();
			}
			return form;
		},
		input: async (name) => (await gamanRequest.formData()).get(name)?.asString(),
		inputs: async (name) =>
			((await gamanRequest.formData()).getAll(name) || []).map((s) => s.asString()),
		file: async (name) => (await gamanRequest.formData()).get(name)?.asFile(),
		files: async (name) =>
			((await gamanRequest.formData()).getAll(name) || []).map((s) => s.asFile()),

		ip: getClientIP(req),
	};
	const cookies = new GamanCookies(gamanRequest);
	const ctx = {
		locals: <A['Locals']>{},
		env: <A['Env']>{},
		url,
		cookies,
		request: gamanRequest,
		session: new GamanSession(app, cookies, gamanRequest),
		response: Response,
		res: Response,

		// data dari request
		headers: gamanRequest.headers,
		header: gamanRequest.header,
		param: gamanRequest.param,
		params: gamanRequest.params,
		query: gamanRequest.query,
		text: gamanRequest.text,
		json: gamanRequest.json,
		formData: gamanRequest.formData,
		input: gamanRequest.input,
		inputs: gamanRequest.inputs,
		file: gamanRequest.file,
		files: gamanRequest.files,

		// data tersembunyi
		[HTTP_REQUEST_SYMBOL]: req,
		[HTTP_RESPONSE_SYMBOL]: res,
	};
	return ctx;
}

// * sementara gini dulu ntar saya tambahin @gaman/trust-proxy
const TRUST_PROXY_IPS = ['127.0.0.1', '::1']; // atau IP proxy kamu

function getClientIP(req: http.IncomingMessage): string {
	const remoteIP = req.socket.remoteAddress || '';

	// Cek apakah request datang dari proxy yang kita percaya
	const isTrustedProxy = TRUST_PROXY_IPS.includes(remoteIP);

	if (isTrustedProxy) {
		const xff = req.headers['x-forwarded-for'];
		if (typeof xff === 'string') {
			const ips = xff.split(',').map((ip) => ip.trim());
			return ips[0]; // Ambil IP paling awal (IP client asli)
		}
	}

	return remoteIP;
}

async function getBody(req: http.IncomingMessage): Promise<Buffer> {
	const chunks: Buffer[] = [];
	return new Promise((resolve, reject) => {
		req.on('data', (chunk) => chunks.push(chunk));
		req.on('end', () => resolve(Buffer.concat(chunks)));
		req.on('error', reject);
	});
}

function createQuery(searchParams: URLSearchParams): Request['query'] {
	const queryFn = ((name: string) => {
		const all = searchParams.getAll(name);
		return all.length > 1 ? all : (all[0] ?? '');
	}) as Request['query'];

	// Copy semua entries ke dalam fungsi agar bisa diakses sebagai object
	for (const [key, value] of searchParams.entries()) {
		if (!(key in queryFn)) {
			(queryFn as any)[key] = value;
		}
	}

	return queryFn;
}

function parseFormUrlEncoded(body: string): FormData {
	const data = querystring.parse(body);
	const result = new FormData();
	for (const [key, value] of Object.entries(data)) {
		if (Array.isArray(value)) {
			const _values: IFormDataEntryValue[] = value.map((v) => ({
				name: key,
				value: v as string, // Cast to string since querystring.parse returns string | string[]
			}));
			result.setAll(key, _values);
		} else {
			result.set(key, {
				name: key,
				value: (value as string) || '',
			});
		}
	}
	return result;
}

async function parseMultipartForm(body: Buffer, contentType: string): Promise<FormData> {
	const formData = new FormData();
	const match = contentType.match(/boundary="?([^";]+)"?/);
	const boundary = match?.[1];
	if (boundary) {
		for (let part of parseMultipart(body, { boundary })) {
			if (part.name) {
				if (part.isText) {
					formData.set(part.name, new FormDataEntryValue(part.name, part.text));
				} else if (part.filename) {
					formData.set(
						part.name,
						new FormDataEntryValue(
							part.name,
							new File(part.filename, part.content, {
								type: part.mediaType,
							}),
						),
					);
				}
			}
		}
	}
	return formData;
}
