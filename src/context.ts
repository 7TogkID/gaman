import http from 'node:http';
import querystring from 'node:querystring';
import type { Context, AppConfig, Request } from './types';
import { FormData, type IFormDataEntryValue } from './utils/form-data';
import Busboy from 'busboy'; // Import Busboy
import { GamanHeaders } from './headers';
import { GamanCookies } from './cookies';
import { HTTP_REQUEST_SYMBOL, HTTP_RESPONSE_SYMBOL } from './symbol';

export async function createContext<A extends AppConfig>(
	req: http.IncomingMessage,
	res: http.ServerResponse,
): Promise<Context<A>> {
	const urlString = req.url || '/';
	const method = req.method || 'GET';
	const url = new URL(urlString, `http://${req.headers.host}`);
	const contentType = req.headers['content-type'] || '';
	const headers = new GamanHeaders(req.headers);

	/** FormData state */
	let form: FormData = null;

	let body: Buffer<ArrayBufferLike> = null;

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
				body = await getRequestBodyBuffer(req);
			}
			return body;
		},
		text: async () => {
			if (body == null) {
				body = await getRequestBodyBuffer(req);
			}
			return body.toString();
		},
		json: async <T>() => {
			if (contentType.includes('application/json') && method !== 'HEAD') {
				if (body == null) {
					body = await getRequestBodyBuffer(req);
				}
				try {
					return JSON.parse(body.toString()) as T;
				} catch {
					return {} as T;
				}
			} else {
				return {} as T;
			}
		},
		formData: async () => {
			if (form !== null) {
				return form;
			}

			if (contentType.includes('application/x-www-form-urlencoded') && method !== 'HEAD') {
				form = parseFormUrlEncoded(body.toString() || '{}');
			} else if (contentType.includes('multipart/form-data') && method !== 'HEAD') {
				const formData = await parseMultipartFormWithBusboy(req);
				form = formData;
			} else {
				form = new FormData();
			}
			return form;
		},
		input: async (name: string) => (await gamanRequest.formData()).get(name)?.asString(),
		ip: getClientIP(req),
	};
	const ctx = {
		locals: <A['Locals']>{},
		env: <A['Env']>{},
		url,
		cookies: new GamanCookies(gamanRequest),
		request: gamanRequest,

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

async function getRequestBodyBuffer(req: http.IncomingMessage): Promise<Buffer> {
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

// --- Fungsi Baru untuk Busboy ---
async function parseMultipartFormWithBusboy(req: http.IncomingMessage): Promise<FormData> {
	const formData = new FormData();

	return new Promise((resolve, reject) => {
		const busboy = Busboy({ headers: req.headers });

		busboy.on('file', (name, fileStream, info) => {
			const { filename, mimeType } = info;
			const fileChunks: Buffer[] = [];
			fileStream.on('data', (chunk) => {
				fileChunks.push(chunk);
			});
			fileStream.on('end', () => {
				const fileBuffer = Buffer.concat(fileChunks);
				formData.set(name, {
					name: name,
					filename: filename,
					mimetype: mimeType,
					// Menggunakan Blob karena GamanFormData.value menerima Blob
					value: new Blob([fileBuffer], { type: mimeType }),
				});
			});
			fileStream.on('error', reject);
		});

		busboy.on('field', (name, val) => {
			formData.set(name, {
				name,
				value: val,
			});
		});

		busboy.on('finish', () => {
			resolve(formData);
		});

		busboy.on('error', reject);

		// Sangat penting: Alirkan request stream ke busboy
		req.pipe(busboy);
	});
}
