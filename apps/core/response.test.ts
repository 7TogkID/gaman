import { describe, it, expect } from 'vitest';
import { Response } from './response'; // sesuaikan path
import { Readable } from 'stream';

describe('Response', () => {
	it('should create a basic response with default values', () => {
		const res = new Response('Hello');
		expect(res.body).toBe('Hello');
		expect(res.status).toBe(200);
		expect(res.statusText).toBe('');
		expect(res.headers.get('Content-Type')).toBeUndefined();
	});

	it('should create json response with correct headers and body', () => {
		const data = { message: 'Hello' };
		const res = Response.json(data);

		expect(res.body).toBe(JSON.stringify(data, null, 2));
		expect(res.headers.get('Content-Type')).toBe('application/json');
	});

	it('should create text response with correct headers and body', () => {
		const res = Response.text('Hello World');

		expect(res.body).toBe('Hello World');
		expect(res.headers.get('Content-Type')).toBe('text/plain');
	});

	it('should create html response with correct headers and body', () => {
		const res = Response.html('<h1>Hello</h1>');

		expect(res.body).toBe('<h1>Hello</h1>');
		expect(res.headers.get('Content-Type')).toBe('text/html');
	});

	it('should create redirect response with location header and status 302', () => {
		const res = Response.redirect('/home');

		expect(res.status).toBe(302);
		expect(res.headers.get('Location')).toBe('/home');
	});

	it('should support custom status and headers', () => {
		const res = new Response('Test', {
			status: 404,
			statusText: 'Not Found',
			headers: {
				'X-Test': 'true',
			},
		});

		expect(res.status).toBe(404);
		expect(res.statusText).toBe('Not Found');
		expect(res.headers.get('X-Test')).toBe('true');
	});

	it('should create stream response', () => {
		const stream = Readable.from(['chunk1', 'chunk2']);
		const res = Response.stream(stream);

		expect(res.body).toBe(stream);
		expect(res.headers.get('Content-Type')).toBe('application/octet-stream');
	});

	it('should render view with correct metadata', () => {
		const res = Response.render('home', { user: 'Joni' }, { status: 200 });

		expect(res.body).toBeNull();
		expect(res.headers.get('Content-Type')).toBe('text/html');

		const render = res.renderData;
		expect(render?.getName()).toBe('home');
		expect(render?.getData()).toEqual({ user: 'Joni' });
		expect(render?.getOptions().status).toBe(200);
	});
});
