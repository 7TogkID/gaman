import { defineIntegration } from "@gaman/core/integration";

export default defineIntegration((app) => ({
	name: 'tes',
	priority: 'normal',
	onLoad: () => {
		Log.info('Integration loaded...');
	},
}));
