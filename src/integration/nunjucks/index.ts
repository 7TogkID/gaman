/**
 * @module
 * GamanJS integration for Nunjucks view rendering.
 */

import { join } from 'path';
import { Priority } from '../../types';
import { defineIntegration } from '..';
import { Response } from '../../response';
import { Log } from '../../utils/logger';
import type { ConfigureOptions, Environment } from 'nunjucks';

let njk: typeof import('nunjucks');

async function loadNunjucks() {
	try {
		njk = await import('nunjucks');
	} catch (err: any) {
		Log.error('Nunjucks is not installed.');
		Log.error('Please install it with: §l§fnpm install nunjucks§r');
		process.exit(1);
	}
}

/**
 * Nunjucks rendering options.
 * These options are passed directly to the Nunjucks renderer.
 * You can find the full list of supported options at:
 * @url https://mozilla.github.io/nunjucks/api.html#configure
 */
export interface GamanNunjucksOptions extends Omit<ConfigureOptions, 'express'> {
	/**
	 * Directory path for views.
	 * This specifies the root directory where your Nunjucks templates are located.
	 * Default: `src/views`.
	 */
	viewPath?: string;

	/**
	 * Priority Integrations
	 * Default: `normal`
	 */
	priority?: Priority;

	/**
	 * Custom environment handler for Nunjucks.
	 *
	 * Allows you to modify the `nunjucks.Environment` instance after it is configured.
	 * You can use this to add custom filters, globals, extensions, or any other environment settings.
	 *
	 * Example:
	 * ```ts
	 * nunjucks({
	 *   env(env) {
	 *     env.addFilter("uppercase", str => str.toUpperCase());
	 *     env.addGlobal("appName", "GamanJS");
	 *   }
	 * });
	 * ```
	 *
	 * You can also provide an array of functions if you want to split your configuration logic:
	 *
	 * Example:
	 * ```ts
	 * nunjucks({
	 *   env: [
	 *     env => env.addFilter("upper", str => str.toUpperCase()),
	 *     env => env.addGlobal("title", "My Site")
	 *   ]
	 * });
	 * ```
	 */
	env?: (env: Environment) => void | ((env: Environment) => void)[];

	/**
	 * Template file extension.
	 *
	 * This specifies the extension used for your Nunjucks template files.
	 * It will be automatically appended when rendering views.
	 *
	 * Default: `.njk`
	 *
	 * Example:
	 * ```ts
	 * extension: '.html' // Will render `index.html` instead of `index.njk`
	 * ```
	 */
	extension?: string;
}

const defaultOps: GamanNunjucksOptions = {
	autoescape: true,
	watch: true,
	extension: '.njk',
};

export async function nunjucks(ops: GamanNunjucksOptions = {}) {
	await loadNunjucks();

	const { viewPath = 'src/views', ...njkOps } = { ...defaultOps, ...ops };

	// Init Nunjucks Environment
	const env = njk.configure(join(process.cwd(), viewPath), njkOps);

	if (njkOps.env) {
		if (Array.isArray(njkOps.env)) {
			for (const fn of njkOps.env) {
				fn(env);
			}
		} else {
			njkOps.env(env);
		}
	}
	return defineIntegration({
		name: 'nunjucks',
		priority: ops.priority || 'normal',
		async onResponse(_app, _ctx, res) {
			const renderData = res.renderData;
			if (renderData == null) return res;

			const pathname = renderData.getName().includes('.')
				? renderData.getName()
				: `${renderData.getName()}.${njkOps.extension}`;

			return new Promise((resolve, reject) => {
				env.render(pathname, renderData.getData(), (err, html) => {
					if (err) return reject(err);
					resolve(Response.html(html || null, { status: 200 }));
				});
			});
		},
	});
}
