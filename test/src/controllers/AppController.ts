import { composeController } from '@gaman/core';
import { service, type AppServiceType } from '../service/AppService';

export default composeController(() => ({
	async Home(ctx) {
		return Res.json({
			message: ctx.param('name'),
		});
	},
	
}));
