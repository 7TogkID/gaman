import gaman, { defineBlock, Response } from '../../dist';
import { beforeAll, describe, expect, it } from 'vitest';
import { Readable } from 'node:stream';

describe('Response test', () => {
	let base: string;
	beforeAll(async () => {
		const app = await gaman.serv({
			server: { port: 0, silent: true },
			blocks: [
				defineBlock({
					routes: {
						'/json': () => Response.json({ message: 'OK!' }),
						'/json2': () => ({ message: 'KEREN' }),
						'/text': () => Response.text('watasi'),
						'/text2': () => 'anusa',
						'/html': () => Response.html('<h1>watasi</h1>'),
						'/html2': () => '<h1>anusa</h1>',
						'/redirect': () => Response.redirect('/home'),
						'/stream': () => Response.stream(Readable.from(['chunk1', 'chunk2'])),

						'/headers': () =>
							new Response('Check headers', {
								headers: {
									'X-Powered-By': 'GamanJS',
								},
							}),
						'/status': () =>
							new Response('Check status', {
								status: 200,
								statusText: 'ok',
							}),
					},
				}),
			],
		});
		const port = app.getServer()?.address()?.port;
		base = `http://localhost:${port}`;
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
