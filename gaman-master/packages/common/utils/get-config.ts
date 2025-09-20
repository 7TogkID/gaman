import { GamanConfig } from '@gaman/core/config/index.js';

let config;

export async function getGamanConfig(): Promise<GamanConfig> {
	if (config) {
		return config;
	}
	try {
		const cfg = await import(`${process.cwd()}/gaman.config.mjs`);
		config = cfg.default || {};
		return config;
	} catch (error) {
		return {};
	}
}
