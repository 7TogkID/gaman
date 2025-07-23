import { beforeAll, describe, expect, it } from 'vitest';
import gaman, { defineBlock } from '../../src';
import { Buffer } from 'node:buffer';
import { FormData } from 'undici';

describe('FormData Request Test', () => {
	let base: string;
	beforeAll(async () => {
		const app = await gaman.serv({
			blocks: [
				defineBlock({
					routes: {
						'/textSingle': async (ctx) => {
							const form = await ctx.formData();
							return {
								data: form.get('name')?.asString(),
							};
						},
						'/textMany': async (ctx) => {
							const form = await ctx.formData();
							return {
								data: form.getAll('names')?.map((s) => {
                  console.log(s.asString());
                  return s.asString();
                }),
							};
						},
						'/fileSingle': async (ctx) => {
							const form = await ctx.formData();
							return {
								data: form.get('avatar')?.asFile(),
							};
						},
						'/fileMany': async (ctx) => {
							const form = await ctx.formData();
							return {
								data: form.getAll('avatars')?.map((f) => f.asFile()),
							};
						},
						'/input': async (ctx) => {
							const username = await ctx.input('username');
							return {
								data: username,
							};
						},
					},
				}),
			],
			server: { port: 0, silent: true },
		});
		const port = app.getServer()?.address()?.port;
		base = `http://localhost:${port}`;
	});

	it('textSingle should return string from form', async () => {
		const form = new FormData();
		form.append('name', 'Joni');

		const res = await fetch(`${base}/textSingle`, {
			method: 'POST',
			body: form,
		});
		const json = await res.json();
		expect(json).toEqual({ data: 'Joni' });
	});

	it('textMany should return array of string from form', async () => {
		const form = new FormData();
		form.append('names', 'A');
		form.append('names', 'B');

		const res = await fetch(`${base}/textMany`, {
			method: 'POST',
			body: form,
		});
		const json = await res.json();
		expect(json).toEqual({ data: ['A', 'B'] });
	});

	it('fileSingle should return a file (Blob)', async () => {
		const form = new FormData();
		form.append(
			'avatar',
			new File([Buffer.from('image-bytes')], 'avatar.png', {
				type: 'image/png',
			}),
		);

		const res = await fetch(`${base}/fileSingle`, {
			method: 'POST',
			body: form,
		});
		const json = await res.json();
		expect(json.data?.type).toBe('image/png');
		expect(json.data?.name).toBe('avatar.png');
		expect(typeof json.data?.size).toBe('number');
	});

	it('fileMany should return array of Blobs', async () => {
		const form = new FormData();
		form.append(
			'avatars',
			new File([Buffer.from('first-file')], '1.txt', {
				type: 'text/plain',
			}),
		);
		form.append(
			'avatars',
			new File([Buffer.from('second-file')], '2.txt', {
				type: 'text/plain',
			}),
		);

		const res = await fetch(`${base}/fileMany`, {
			method: 'POST',
			body: form,
		});
		const json = await res.json();
		expect(Array.isArray(json.data)).toBe(true);
		expect(json.data.length).toBe(2);
		expect(json.data[0]?.name).toBe('1.txt');
		expect(json.data[1]?.name).toBe('2.txt');
	});

	it('input should return string from urlencoded input', async () => {
		const form = new URLSearchParams();
		form.append('username', 'angga');

		const res = await fetch(`${base}/input`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: form,
		});
		const json = await res.json();
		expect(json).toEqual({ data: 'angga' });
	});
});
