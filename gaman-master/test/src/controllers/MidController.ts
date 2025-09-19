import { composeController } from '@gaman/core';

export default composeController(() => ({
	Index() {
		return Res.text('<h1>Hai</h1>');
	},
}));
