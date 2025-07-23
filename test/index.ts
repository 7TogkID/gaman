import gaman from 'gaman';
import {defineBlock} from "gaman/block"

gaman.serv({
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
					const data = await ctx.files('gaman');
					return ctx.res.json(data);
				},
			},
		}),
	],
	server: { port: 3421 },
});
