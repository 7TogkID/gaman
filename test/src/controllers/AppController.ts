import { composeController } from '@gaman/core';
import { AppService, type AppServiceType } from '../service/AppService';

type Params = [AppServiceType];

export default composeController<Params>((ser = AppService('asda')) => ({
	async Home(ctx) {
		return Res.json({
			message: ser.Welcome(),
		});
	},
}));
