import { composeController } from '@gaman/core';

export default composeController(() => ({
	async Home(ctx) {
		return Res.json({
			message: ctx.param('name'),
		});
	},
}));
