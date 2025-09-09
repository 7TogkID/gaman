/**
 * @module
 * GamanJS integration for EJS view rendering.
 */
import { type Options } from 'ejs';
import { join } from 'path';
import { Log, DefaultMiddlewareOptions } from '@gaman/common';
import { composeMiddleware } from '@gaman/core/index.js';

let _ejs: typeof import('ejs');

async function loadEJS() {
	try {
		const { default: njkModule } = await import('ejs');
		_ejs = njkModule;
	} catch (err: any) {
		Log.error('ejs is not installed.');
		Log.error('Please install it with: §l§fnpm install ejs§r');
		Log.error(
			'(Optional) if you use typescript: §l§fnpm install --save-dev @types/ejs§r',
		);
		process.exit(1);
	}
}

/**
 * EJS rendering options.
 * These options are passed directly to the EJS renderer.
 * You can find the full list of supported options at:
 * @url https://github.com/mde/ejs?tab=readme-ov-file#options
 */
export interface GamanEJSOptions extends Options, DefaultMiddlewareOptions {
	/**
	 * Directory path for views.
	 * This specifies the root directory where your EJS templates are located.
	 * Default: `src/views`.
	 */
	viewPath?: string;
}

export function ejs(ops: GamanEJSOptions = {}) {
	const { viewPath, ...ejsOps } = ops;

	const middleware = composeMiddleware(async (ctx, next) => {
		if (!_ejs) {
			await loadEJS();
		}

		const res = await next();

		const renderData = res.view;
		if (renderData == null) return res; // ! next() if renderData null

		const filePath = join(
			process.cwd(),
			viewPath || 'src/views',
			`${renderData.getName()}.ejs`,
		);
		const rendered = await _ejs.renderFile(
			filePath,
			renderData.getData(),
			ejsOps,
		);

		res.headers.set('Content-Type', 'text/html');
		res.body = rendered;

		return res;
	});
	return middleware({
		priority: ops.priority,
		includes: ops.includes,
		excludes: ops.excludes,
	});
}
