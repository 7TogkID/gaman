import { composeController } from '@gaman/core';

export default composeController(() => ({
	Home(ctx) {
		return Res.json({
			message: 'Welcome',
		});
	},
}));
