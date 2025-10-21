import { createReadStream, promises as fsPromises, Stats, statSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import {
	DefaultMiddlewareOptions,
	detectMime,
	getGamanConfig,
	Log,
	Priority,
} from '@gaman/common';
import { composeMiddleware, Response } from '@gaman/core';
import { isDevelopment } from '@gaman/cli/builder/helper.js';

export interface StaticFileOptions extends DefaultMiddlewareOptions {
	/**
	 * @ID kustom mime type konten (contoh: { 'css': 'text/css' })
	 * @EN custom content mime type (example: { 'css': 'text/css' })
	 */
	mimes?: Record<string, string>;

	/**
	 * @ID File default jika direktori diakses (default: index.html)
	 * @EN Default file if directory is accessed (default: index.html)
	 */
	defaultDocument?: string;

	/**
	 * @ID Rewriter path (misal: hapus /static/)
	 * @EN Rewriter path (eg: delete /static/)
	 *
	 * @param path
	 * @returns
	 */
	rewriteRequestPath?: (path: string) => string;

	/**
	 * @ID Menangani saat file ditemukan.
	 * @EN Handles when files are found.
	 *
	 * @param path
	 * @param ctx
	 * @returns
	 */
	onFound?: (path: string, ctx: any) => void | Promise<void>;

	/**
	 * @ID Menangani saat file tidak ditemukan.
	 * @EN Handling when file is not found.
	 *
	 * @param path
	 * @param ctx
	 * @returns
	 */
	onNotFound?: (path: string, ctx: any) => void | Promise<void>;

	/**
	 * @ID Header Cache-Control (default: 1 jam = 'public, max-age=3600')
	 * @EN Cache-Control header (default: 1 hour = 'public, max-age=3600')
	 */
	cacheControl?: string;

	/**public
	 * @ID Jika `true`, fallback ke `index.html` untuk SPA.
	 * @EN If `true`, return to `index.html` for SPA.
	 */
	fallbackToIndexHTML?: boolean;
}

// Buat ETag dari ukuran dan waktu modifikasi file
function generateETag(stat: { size: number; mtime: Date }) {
	const tag = `${stat.size}-${stat.mtime.getTime()}`;
	return `"${crypto.createHash('sha1').update(tag).digest('hex')}"`;
}

/**
 * Serve static files for your GamanJS app.
 *
 * This middleware allows you to serve static assets like images, JavaScript, CSS,
 * or even entire HTML pages from a specific folder (default: `public/`).
 *
 * It includes automatic detection for:
 * - MIME types (customizable via `mimes`)
 * - Brotli (.br) and Gzip (.gz) compression based on `Accept-Encoding`
 * - ETag generation for efficient caching (supports 304 Not Modified)
 *
 * ## Options
 * - `mimes`: Custom MIME types. You can map file extensions manually.
 * - `priority`: Determines execution order. Use `'very-high'` if you want static to run early.
 * - `defaultDocument`: Filename to serve when a directory is requested (default: `index.html`).
 * - `rewriteRequestPath`: A function to rewrite request paths (e.g., strip `/static` prefix).
 * - `onFound`: Optional callback when a static file is found and served.
 * - `onNotFound`: Optional callback when no file is found at the requested path.
 * - `cacheControl`: Customize `Cache-Control` header. Default is 1 hour.
 * - `fallbackToIndexHTML`: If true, fallback to `index.html` for unmatched routes (SPA support).
 *
 * ## Example
 * ```ts
 * staticServe({
 *   rewriteRequestPath: (p) => p.replace(/^\/static/, ''),
 *   fallbackToIndexHTML: true,
 *   mimes: {
 *     '.webmanifest': 'application/manifest+json'
 *   }
 * })
 * ```
 */
export function staticServe(options: StaticFileOptions = {}) {
	let staticPath;
	const defaultDocument = options.defaultDocument ?? 'index.html';
	const cacheControl = options.cacheControl ?? 'public, max-age=3600';

	const middleware = composeMiddleware(async (ctx, next) => {
		let reqPath = ctx.request.pathname;

		//? Rewriting path jika disediakan
		if (options.rewriteRequestPath) {
			reqPath = options.rewriteRequestPath(reqPath);
		}
		if (!staticPath) {
			const config = await getGamanConfig();
			staticPath = config.build?.staticdir || 'public'; // ? init staticPath for (development)

			if (!isDevelopment(config.build?.outdir || 'dist')) {
				/**
				 * if on production mode staticPath like this: /dist/client/public
				 */
				staticPath = join(config.build?.outdir || 'dist', 'client', staticPath);
			}
		}

		let filePath = join(process.cwd(), staticPath, reqPath);
		let stats: Stats;

		//? Cari file (jika direktori, cari defaultDocument)
		try {
			stats = await fsPromises.stat(filePath);

			if (stats.isDirectory()) {
				filePath = join(filePath, defaultDocument);
				stats = await fsPromises.stat(filePath);
			}
		} catch {
			// Fallback ke index.html untuk SPA
			if (options.fallbackToIndexHTML) {
				try {
					filePath = join(process.cwd(), staticPath, 'index.html');
					stats = await fsPromises.stat(filePath);
				} catch {
					await options.onNotFound?.(filePath, ctx);
					return await next();
				}
			} else {
				await options.onNotFound?.(filePath, ctx);
				return await next();
			}
		}

		if (!stats.isFile()) return await next();
		Log.setRoute('');
		Log.setMethod('');
		Log.setStatus(null);

		// ? Gzip/Brotli: cek Accept-Encoding dan cari file terkompresi
		const acceptEncoding = ctx.request.header('accept-encoding') || '';
		let encoding: 'br' | 'gzip' | null = null;
		let encodedFilePath = filePath;

		if (acceptEncoding.includes('br')) {
			try {
				await fsPromises.access(`${filePath}.br`);
				encoding = 'br';
				encodedFilePath = `${filePath}.br`;
			} catch {}
		} else if (acceptEncoding.includes('gzip')) {
			try {
				await fsPromises.access(`${filePath}.gz`);
				encoding = 'gzip';
				encodedFilePath = `${filePath}.gz`;
			} catch {}
		}

		//? Buat ETag dan handle conditional GET
		let statForEtag = stats;
		try {
			statForEtag = statSync(encodedFilePath);
		} catch {}
		const etag = generateETag(statForEtag);
		if (ctx.request.header('if-none-match') === etag) {
			return Response.notModified();
		}

		const contentType =
			detectMime(filePath, options.mimes) || 'application/octet-stream';

		await options.onFound?.(encodedFilePath, ctx);

		return Response.stream(createReadStream(encodedFilePath), {
			status: 200,
			headers: {
				'Content-Type': contentType,
				...(encoding ? { 'Content-Encoding': encoding } : {}),
				Vary: 'Accept-Encoding',
				ETag: etag,
				'Cache-Control': cacheControl,
			},
		});
	});
	return middleware({
		priority: options.priority ?? Priority.MONITOR,
		includes: options.includes,
		excludes: options.excludes,
	});
}
