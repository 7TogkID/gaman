import { createReadStream, promises as fsPromises, statSync } from 'fs';
import { join } from 'path';
import { defineIntegration } from '..';
import { Response } from '../../response';
import { Log } from '../../utils/logger';
import crypto from 'crypto';
import { detectMime } from '../../utils/mime';
import { Priority } from '../../types';

// Tipe opsi konfigurasi middleware
export interface StaticFileOptions {
	path?: string; 
	mimes?: Record<string, string>
	priority?: Priority;
	defaultDocument?: string; // File default jika direktori diakses (default: index.html)
	rewriteRequestPath?: (path: string) => string; // Rewriter path (misal: hapus /static/)
	onFound?: (path: string, ctx: any) => void | Promise<void>; // Callback saat file ditemukan
	onNotFound?: (path: string, ctx: any) => void | Promise<void>; // Callback saat file tidak ditemukan
	cacheControl?: string; // Header Cache-Control (default: 1 jam)
	fallbackToIndexHTML?: boolean; // Jika true, fallback ke index.html untuk SPA
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
 * - `path`: Root directory of static assets. Default is `public`.
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
 * gamanStatic({
 *   path: 'assets',
 *   rewriteRequestPath: (p) => p.replace(/^\/static/, ''),
 *   fallbackToIndexHTML: true,
 *   mimes: {
 *     '.webmanifest': 'application/manifest+json'
 *   }
 * })
 * ```
 */
export function gamanStatic(options: StaticFileOptions = {}) {
	const staticPath = options.path || 'public';
	const defaultDocument = options.defaultDocument ?? 'index.html';
	const cacheControl = options.cacheControl ?? 'public, max-age=3600';

	return defineIntegration({
		name: 'static',
		priority: options.priority || 'very-high',

		async onRequest(_app, ctx) {
			let reqPath = ctx.request.pathname;

			// Rewriting path jika disediakan
			if (options.rewriteRequestPath) {
				reqPath = options.rewriteRequestPath(reqPath);
			}

			let filePath = join(process.cwd(), staticPath, reqPath);
			let stats;

			// Cari file (jika direktori, cari defaultDocument)
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
						return;
					}
				} else {
					await options.onNotFound?.(filePath, ctx);
					return;
				}
			}

			if (!stats.isFile()) return;

			// Gzip/Brotli: cek Accept-Encoding dan cari file terkompresi
			const acceptEncoding = ctx.request.headers.get('accept-encoding') || '';
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

			// Buat ETag dan handle conditional GET
			const etag = generateETag(statSync(encodedFilePath));
			if (ctx.request.headers.get('if-none-match') === etag) {
				return Response.text('', { status: 304 });
			}

			// Cari MIME type dari ekstensi
			const contentType = detectMime(filePath, options.mimes) || 'application/octet-stream';

			// Matikan log route bawaan GamanJS (supaya tidak log 2x)
			Log.setRoute('');
			Log.setMethod('');
			Log.setStatus(null);

			// Callback saat ditemukan
			await options.onFound?.(encodedFilePath, ctx);

			// Kirim file
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
		},
	});
}
