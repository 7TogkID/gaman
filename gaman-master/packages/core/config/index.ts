import type { Plugin } from 'esbuild';

export interface GamanBuildConfig{
	includes?: string[];
	excludes?: string[];
	outdir?: string;
	rootdir?: string;
	esbuildPlugins?: Plugin[];
	alias?: Record<string, string>
}

export interface GamanConfig {
	verbose?: boolean;
	build?: GamanBuildConfig;
}

export function defineConfig(config: GamanConfig): GamanConfig {
	return config;
}
