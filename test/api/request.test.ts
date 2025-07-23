import gaman from 'gaman';
import {defineBlock} from "gaman/block"
import { beforeAll, describe, expect, it } from 'vitest';

describe('Request Test', () => {
	let base: string;
	beforeAll(async () => {
		const app = await gaman.serv({
			blocks: [
				defineBlock({
					routes: {
						'/json': async (ctx) => {
							const data = await ctx.json();
							return data;
						},
						'/text': async (ctx) => {
							const data = await ctx.text();
							return data;
						},
					},
				}),
			],
			server: { port: 0, silent: true },
		});
		// @ts-ignore
		const port = app.getServer()?.address()?.port;
		base = `http://localhost:${port}`;
	});

	it('POST json', async () => {
		const data = await (
			await fetch(`${base}/json`, {
				headers: {
					'Content-Type': 'application/json',
				},
				method: "POST",
				body: JSON.stringify({
					name: 'angga7togk',
				}),
			})
		).json();
		expect(data).toEqual({
			name: 'angga7togk',
		});
	});

	it('POST text', async () => {
		const data = await (
			await fetch(`${base}/text`, {
				headers: {
					'Content-Type': 'application/plain',
				},
				method: "POST",
				body: "angga7togk",
			})
		).text();
		expect(data).toBe("angga7togk")
	});
});
