/**
 * @module
 * CORS Middleware for Gaman.
 * Implements Cross-Origin Resource Sharing (CORS) with customizable options.
 */

import { DefaultMiddlewareOptions, Middleware, Priority } from '@gaman/common/index.js';
import { composeMiddleware } from '@gaman/core';
import { Response } from '@gaman/core/response.js';

/**
 * CORS middleware options.
 */
export interface CorsOptions extends DefaultMiddlewareOptions {
	/** Allowed origin(s) for the request. */
	origin?: string | string[] | null;
	/** HTTP methods allowed for the request. Default: `["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"]` */
	allowMethods?: string[];
	/** Headers allowed in the request. Default: `["Content-Type", "Authorization"]` */
	allowHeaders?: string[];
	/** Maximum cache age for preflight requests (in seconds). */
	maxAge?: number;
	/** Whether to include credentials (cookies, HTTP auth, etc.) in the request. */
	credentials?: boolean;
	/** Headers exposed to the client in the response. */
	exposeHeaders?: string[];
}

/**
 * Middleware for handling Cross-Origin Resource Sharing (CORS).
 * @param options - The options for configuring CORS behavior.
 * @returns Middleware function for handling CORS.
 */

export const cors = (options?: CorsOptions): Middleware => {
	const {
		origin = '*',
		allowMethods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowHeaders = [],
		maxAge,
		credentials,
		exposeHeaders,
	} = options || {};

	const middleware = composeMiddleware(async (ctx, next) => {
		const requestOrigin = ctx.header('Origin');
		// Determine allowed origin
		let allowedOrigin: string | undefined = '*';

		if (typeof origin === 'string') {
			allowedOrigin = origin;
		} else if (Array.isArray(origin) && origin.includes(requestOrigin || '')) {
			allowedOrigin = requestOrigin;
		} else {
			allowedOrigin = undefined;
		}

		// Set CORS headers
		const headers: Record<string, string> = {};

		if (allowedOrigin) {
			headers['Access-Control-Allow-Origin'] = allowedOrigin;
		}

		if (allowMethods.length) {
			headers['Access-Control-Allow-Methods'] = allowMethods.join(', ');
		}

		if (allowHeaders.length) {
			headers['Access-Control-Allow-Headers'] = allowHeaders.join(', ');
		}
		if (maxAge) {
			headers['Access-Control-Max-Age'] = maxAge.toString();
		}
		if (credentials) {
			headers['Access-Control-Allow-Credentials'] = 'true';
		}
		if (exposeHeaders?.length) {
			headers['Access-Control-Expose-Headers'] = exposeHeaders.join(', ');
		}

		// Handle preflight request
		if (ctx.request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers });
		}

		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
		if (allowedOrigin && allowedOrigin !== '*') {
			const existingVary = ctx.headers.get('Vary');
			ctx.headers.set(
				'Vary',
				existingVary ? `${existingVary}, Origin` : 'Origin',
			);
		}

		for (const [key, value] of Object.entries(headers)) {
			if (!ctx.headers.has(key)) {
				ctx.headers.set(key, value);
			}
		}

		return await next();
	});

	return middleware({
		priority: Priority.MONITOR,
		includes: options?.includes,
		excludes: options?.excludes,
	});
};
