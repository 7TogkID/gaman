import { defineBlock, Response } from 'gaman';

export default defineBlock({
	routes: {
		'/': async (ctx) => {
			await ctx.session.set('anusa-watashi', {
				name: 'JONI ANGGARA',
				umur: 18,
			});
			const value = await ctx.session.get('anusa-watashi');
			return Response.json(value);
		},
	},
});
