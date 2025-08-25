import { composeHandler } from '@gaman/core/handler';

export default composeHandler(() => ({
	CreateHandler(ctx) {
		console.log('PROSES');
		return Res.json({ message: 'OK!' });
	},
}));
