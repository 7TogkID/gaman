import { beforeAll, describe, expect, it } from 'vitest';
import { defineBlock } from '../../packages/core/block';
import { defineRoutes } from '../../packages/core/routes';
import { defineBootstrap } from '../../packages/core/index';

describe('Request Test', () => {
	let base: string = `http://localhost:3434`;
	beforeAll(async () => {
		defineBootstrap(
			defineBlock({
				routes: [
					defineRoutes(() => ({
						'/json': async (ctx) => {
							const data = await ctx.json();
							return data;
						},
						'/text': async (ctx) => {
							const data = await ctx.text();
							return data;
						},
					})),
				],
			}),
			(app) => {
				app.setSilent();
				app.listen(3434, 'localhost', () => {});
			},
		);
	});

	it('POST json', async () => {
		const data = await (
			await fetch(`${base}/json`, {
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
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
				method: 'POST',
				body: 'angga7togk',
			})
		).text();
		expect(data).toBe('angga7togk');
	});
});
