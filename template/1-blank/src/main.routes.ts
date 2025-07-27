import { defineRoutes } from '@gaman/core/routes';

export default defineRoutes(() => ({
	'/': (ctx) => {
		return r.json({ message: '❤️ Welcome to GamanJS' });
	},
}));
