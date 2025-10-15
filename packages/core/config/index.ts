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
	 * @ID Kustomisasi esbuild plugins jika builder memakai `esbuild`
	 */
	esbuildPlugins?: Plugin[];

	/**
	 * @ID alias import contoh: `{ "@controller/**": "./src/controller/**" }`
	 */
	alias?: Record<string, string>;

	/**
	 * @ID Berfungsi untuk mengatur folder auto import tujuanya buat auto register semisal `autoComposeRoutes` dll
	 */
	autoComposeDirs?: {
		/**
		 * @ID `autoComposeRoutes` (default: ['/routes', '/route])
		 */
		routes?: string[];
		/**
		 * @ID `autoComposeMiddleware` (default: ['/middlewares', '/middleware'])
		 */
		middlewares?: string[];
		/**
		 * @ID `autoComposeInterceptor` (default: ['/interceptors', '/interceptor'])
		 */
		interceptors?: string[];
		/**
		 * @ID `autoComposeExceptionHandler` (default: ['/exceptions', '/exceptions'])
		 */
		exceptions?: string[];
	};
}

export interface GamanConfig {
	verbose?: boolean;
	build?: GamanBuildConfig;
}

export function defineConfig(config: GamanConfig): GamanConfig {
	return config;
}
