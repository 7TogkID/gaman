import { describe, it, expect, vi } from 'vitest';
import { createContext } from './context';
import type http from 'node:http';
import { Readable } from 'stream';

function mockRequest({
	method = 'GET',
	url = '/?hello=world',
	headers = {},
	body,
}: {
	method?: string;
	url?: string;
	headers?: Record<string, string>;
	body?: string;
}): http.IncomingMessage {
	const stream = new Readable() as http.IncomingMessage;
	stream._read = () => {}; // Required
	stream.method = method;
	stream.url = url;
	stream.headers = headers;
	stream.socket = { remoteAddress: '127.0.0.1' } as any;

	if (body) {
		// Simulate the stream body
		setImmediate(() => {
			stream.emit('data', Buffer.from(body));
			stream.emit('end');
		});
	} else {
		setImmediate(() => {
			stream.emit('end');
		});
	}

	return stream;
}

function mockResponse(): http.ServerResponse {
	return {
		setHeader: vi.fn(),
		getHeader: vi.fn(),
		end: vi.fn(),
		write: vi.fn(),
		writeHead: vi.fn(),
	} as unknown as http.ServerResponse;
}

describe('createContext()', () => {
	it('parses query and headers', async () => {
		const req = mockRequest({
			url: '/?name=joni',
			headers: {
				'content-type': 'application/json',
				'x-forwarded-for': '1.2.3.4',
			},
		});
		const res = mockResponse();

		const ctx = await createContext(req, res);

		expect(ctx.query('name')).toBe('joni');
		expect(ctx.header('x-forwarded-for')).toBe('1.2.3.4');
		expect(ctx.request.ip).toBe('1.2.3.4');
	});

	it('parses JSON body', async () => {
		const body = JSON.stringify({ message: 'hello' });
		const req = mockRequest({
			method: 'POST',
			url: '/',
			headers: {
				'content-type': 'application/json',
			},
			body,
		});
		const res = mockResponse();

		const ctx = await createContext(req, res);
		const json = await ctx.json<{ message: string }>();

		expect(json.message).toBe('hello');
	});

	it('parses x-www-form-urlencoded', async () => {
		const body = 'username=joni&age=20';
		const req = mockRequest({
			method: 'POST',
			url: '/',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'content-length': body.length.toString(),
			},
			body,
		});
		const res = mockResponse();

		const ctx = await createContext(req, res);
		const form = await ctx.formData();

		expect(form.get('username')?.asString()).toBe('joni');
		expect(form.get('age')?.asString()).toBe('20');
	});

	it('should parse multipart/form-data', async () => {
		const boundary = '----testboundary123';
		const body = [
			`--${boundary}`,
			'Content-Disposition: form-data; name="username"',
			'',
			'joni',
			`--${boundary}`,
			'Content-Disposition: form-data; name="age"',
			'',
			'20',
			`--${boundary}--`,
			'',
		].join('\r\n');

		const req = mockRequest({
			method: 'POST',
			url: '/',
			headers: {
				'content-type': `multipart/form-data; boundary=${boundary}`,
				'content-length': body.length.toString(),
			},
			body: body,
		});
		const res = mockResponse();
		const ctx = await createContext(req, res);

		const form = await ctx.formData();
		expect(form.get('username')?.asString()).toBe('joni');
		expect(form.get('age')?.asString()).toBe('20');
	});
});
