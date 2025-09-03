import { composeController } from '@gaman/core';

export default composeController(() => ({
	HelloWorld(ctx) {
		return Res.json({ message: '❤️ Welcome to GamanJS' });
	},
}));