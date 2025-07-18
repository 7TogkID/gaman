/**
 * @module
 * GamanJS integration for serving static files.
 */

import { createReadStream, promises as fsPromises } from 'fs';
import { join, extname } from 'path';
import { Priority } from '../../types';
import { defineIntegration } from '..';
import { Log } from '../../utils/logger';
import { Response } from '../../response';

/**
 * MIME type mappings for static file responses.
 */
const mimeType: Record<string, string> = {
	'.ico': 'image/x-icon',
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.css': 'text/css',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.wav': 'audio/wav',
	'.mp3': 'audio/mpeg',
	'.svg': 'image/svg+xml',
	'.pdf': 'application/pdf',
	'.zip': 'application/zip',
	'.doc': 'application/msword',
	'.eot': 'application/vnd.ms-fontobject',
	'.ttf': 'application/x-font-ttf',
};

/**
 * Options for the static file integration.
 */
export interface StaticFileOptions {
	/**
	 * Directory to serve static files from.
	 * Default: `public`.
	 */
	path?: string;

	/**
	 * Added your mimeTypes
	 * @example {".mp3": "audio/mpeg"}
	 */
	newMimeTypes?: Record<string, string>;

	/**
	 * Priority Integrations
	 * @default very-high
	 */
	priority?: Priority;
}

export function gamanStatic(options: StaticFileOptions = {}) {
	const staticPath = options.path || 'public';
	const mimeTypes = { ...mimeType, ...(options.newMimeTypes || {}) };

	return defineIntegration({
		name: 'static',
		priority: options.priority || 'very-high', // ! harus very-high, biar di jalain terlebih dahulu, biar bypass middleware lain
		async onRequest(_app, ctx) {
			try {
				// Resolve the file path
				const filePath = join(process.cwd(), staticPath, ctx.request.pathname);

				// Check if the file exists
				const stats = await fsPromises.stat(filePath);
				if (!stats.isFile()) {
					return; // Let other integrations handle the request
				}

				// ! cegah kirim log request
				Log.setRoute('');
				Log.setMethod('');
				Log.setStatus(null);

				// Determine MIME type
				const ext = extname(filePath);
				const contentType = mimeTypes[ext] || 'application/octet-stream';

				// Create a readable stream for the file
				const fileStream = createReadStream(filePath);

				// Return the file as a response
				return Response.stream(fileStream, {
					status: 200,
					headers: {
						'Content-Type': contentType,
					},
				});
			} catch (err: any) {
				// Ignore errors for file not found or access issues
				if (err.code === 'ENOENT' || err.code === 'EACCES') {
					return; // Let other integrations handle the request
				}
				throw err; // Rethrow other errors
			}
		},
	});
}
