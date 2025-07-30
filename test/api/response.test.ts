import { beforeAll, describe, expect, it } from 'vitest';
import { Readable } from 'node:stream';
import { defineBootstrap } from '../../packages/core';
import { defineBlock } from '../../packages/core/block';
import { defineRoutes } from '../../packages/core/routes';

describe('Response test', () => {
	let base: string = `http://localhost:3433`;
	beforeAll(async () => {
		await defineBootstrap(
			defineBlock({
				routes: [
					defineRoutes(() => ({
						'/json': () => r.json({ message: 'OK!' }),
						'/json2': () => ({ message: 'KEREN' }),
						'/text': () => r.text('watasi'),
						'/text2': () => 'anusa',
						'/html': () => r.html('<h1>watasi</h1>'),
						'/html2': () => '<h1>anusa</h1>',
						'/redirect': () => r.redirect('/home'),
						'/stream': () => r.stream(Readable.from(['chunk1', 'chunk2'])),

						'/headers': () =>
							new r('Check headers', {
								headers: {
									'X-Powered-By': 'GamanJS',
								},
							}),
						'/status': () =>
							new r('Check status', {
								status: 200,
								statusText: 'ok',
							}),
					})),
				],
			}),
			(app) => {
        app.setSilent()
				app.listen(3433, 'localhost', () => {});
			},
		);
	});

	it('/json should return JSON object', async () => {
		const res = await fetch(`${base}/json`);
		const data = await res.json();
		expect(data).toEqual({ message: 'OK!' });
	});

	it('/json2 should return JSON from object shorthand', async () => {
		const res = await fetch(`${base}/json2`);
		const data = await res.json();
		expect(data).toEqual({ message: 'KEREN' });
	});

	it('/text should return plain text', async () => {
		const res = await fetch(`${base}/text`);
		const text = await res.text();
		expect(text).toBe('watasi');
	});

	it('/text2 should return plain text from string return', async () => {
		const res = await fetch(`${base}/text2`);
		const text = await res.text();
		expect(text).toBe('anusa');
	});

	it('/html should return HTML', async () => {
		const res = await fetch(`${base}/html`);
		const html = await res.text();
		expect(html).toBe('<h1>watasi</h1>');
	});

	it('/html2 should return HTML from string return', async () => {
		const res = await fetch(`${base}/html2`);
		const html = await res.text();
		expect(html).toBe('<h1>anusa</h1>');
	});

	it('/redirect should respond with redirect status', async () => {
		const res = await fetch(`${base}/redirect`, { redirect: 'manual' });
		expect(res.status).toBeGreaterThanOrEqual(300);
		expect(res.status).toBeLessThan(400);
		expect(res.headers.get('location')).toBe('/home');
	});

	it('/stream should return streamed response', async () => {
		const res = await fetch(`${base}/stream`);
		const text = await res.text();
		expect(text).toBe('chunk1chunk2');
	});

	it('/headers should return custom header', async () => {
		const res = await fetch(`${base}/headers`);
		expect(res.headers.get('x-powered-by')).toBe('GamanJS');
	});

	it('/status should return custom status and text', async () => {
		const res = await fetch(`${base}/status`);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe('Check status');
	});
});
``;
