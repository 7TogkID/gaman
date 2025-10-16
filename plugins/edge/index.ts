/**
 * @module
 * GamanJS integration for the Edge view engine.
 *
 * @ID Integrasi GamanJS dengan Edge view engine.
 */

import { DefaultMiddlewareOptions } from '@gaman/common';
import { composeMiddleware } from '@gaman/core/index.js';
export * from './compose.js';

import { Edge } from 'edge.js';
import { EdgeHandlerFactory } from './compose.js';
import { EdgeOptions } from 'edge.js/types';
import { join } from 'path';

/**
 * Edge Engine options.
 * These options are passed directly to the Edge Engine.
 * You can find the full list of supported options at:
 * @url https://edgejs.dev/docs/getting_started
 *
 * @ID Opsi konfigurasi untuk Edge Engine.
 * Opsi ini diteruskan langsung ke Edge Engine.
 * Daftar lengkap opsi bisa dilihat di:
 * @url https://edgejs.dev/docs/getting_started
 */
export interface GamanEdgeOptions
	extends EdgeOptions,
		DefaultMiddlewareOptions {
	/**
	 * Directory path for views.
	 * Specifies the root directory where Edge templates are located.
	 * Default: `src/views`.
	 *
	 * @ID Path direktori untuk view.
	 * Menentukan direktori utama tempat file template Edge disimpan.
	 * Default: `src/views`.
	 */
	viewPath?: string;

	/**
	 * Custom handler for the Edge instance.
	 * Example: `(edge) => { edge.mount()... }`
	 *
	 * @ID Handler kustom untuk instance Edge.
	 * Contoh: `(edge) => { edge.mount()... }`
	 */
	handler?: EdgeHandlerFactory;
}

/**
 * Creates an Edge view engine middleware for GamanJS.
 *
 * @ID Membuat middleware view engine Edge untuk GamanJS.
 */
export function edge(ops: GamanEdgeOptions = {}) {
	const { viewPath = 'src/views', handler } = ops;
	let edge: Edge;

	const middleware = composeMiddleware(async (_, next) => {
		if (!edge) {
			edge = Edge.create({
				cache: ops.cache,
				loader: ops.loader,
			});
			edge.mount(join(process.cwd(), viewPath));

			await handler?.(edge);
		}

		// ? Continue request chain
		const res = await next();

		const renderData = res.view;
		if (renderData == null) return res;

		const rendered = await edge.render(
			renderData.getName(),
			renderData.getData(),
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
