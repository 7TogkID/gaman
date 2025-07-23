import { beforeAll, describe, expect, it } from 'vitest';
import gaman, { defineBlock } from '../../src';
import axios from 'axios';

describe('Gaman Server Test', () => {
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
						'/formData': async (ctx) => {
							const formData = await ctx.formData();
							return formData.getAll('name')?.map((s) => s.asString());
						},
					},
				}),
			],
			server: { port: 3421},
		});
		const port = app.getServer()?.address()?.port;
		base = `http://localhost:${port}`;
	});

	// it('Test Request', async () => {
	// 	const res = await axios.post(`${base}/json`, {
	// 		name: 'angga7togk',
	// 	});
	// 	expect(res.data).toEqual({
	// 		name: 'angga7togk',
	// 	});
	// });

	it('Test request form data', async () => {
		try {
			const formData = new FormData();
		formData.append('name', 'Joni Anggara2');
		formData.append('name', 'Joni Anggara');

		const res = await axios.post(`${base}/formData`, formData);
		
		} catch (error) {
			
		}
	});
});
