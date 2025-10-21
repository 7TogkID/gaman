import type { Plugin } from 'esbuild';

export interface GamanBuildConfig {
	/**
	 * @ID build file atau folder tertentu misal: `./anu.js`
	 */
	includes?: string[];

	/**
	 * @ID jangan build file atau folder tertentu
	 */
	excludes?: string[];

	/**
	 * @ID folder hasil build (default: `dist`)
	 */
	outdir?: string;

	/**
	 * @ID Root folder proyek (default: `src`)
	 */
	rootdir?: string;

	/**
	 * @ID Static file folder
	 */
	staticdir?: string;

	/**
	 * @ID Kustomisasi esbuild plugins jika builder memakai `esbuild`
	 */
	esbuildPlugins?: Plugin[];

	/**
	 * @ID alias import contoh: `{ "@controller/**": "./src/controller/**" }`
	 */
	alias?: Record<string, string>;
}

export interface GamanConfig {
	verbose?: boolean;
	build?: GamanBuildConfig;
}

export function defineConfig(config: GamanConfig): GamanConfig {
	return config;
}
