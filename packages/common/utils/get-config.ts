import { GamanConfig } from '@gaman/core/config/index.js';

const defaultConfig: GamanConfig = {
	verbose: false,
	build: {
		outdir: 'dist',
		rootdir: 'src',
		staticdir: 'public',
		excludes: ['**/node_modules/**', '**/dist/**', '**/*.test.*'],
		includes: ['src/**/*.{ts,js}'],
	},
};

let config;
export async function getGamanConfig(): Promise<GamanConfig> {
	if (config) return config;

	try {
		const cfg = await import(`${process.cwd()}/gaman.config.mjs`);
		const userConfig = cfg.default || {};

		config = {
			...defaultConfig,
			...userConfig,
			build: {
				...defaultConfig.build,
				...userConfig.build,
			},
		};

		return config;
	} catch (error) {
		return defaultConfig;
	}
}
