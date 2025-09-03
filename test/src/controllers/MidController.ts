import { composeController } from '@gaman/core';

export default composeController(() => ({
	Index() {
		return Res.html('<h1>Hai</h1>');
	},
}));
