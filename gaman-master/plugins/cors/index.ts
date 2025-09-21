/**
 * @module
 * CORS Middleware for Gaman.
 */

import {
  DefaultMiddlewareOptions,
  Middleware,
  Priority,
} from '@gaman/common/index.js';
import { composeMiddleware } from '@gaman/core';
import { Response } from '@gaman/core/response.js';

export interface CorsOptions extends DefaultMiddlewareOptions {
  origin?: string | string[] | null;
  allowMethods?: string[];
  allowHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
  exposeHeaders?: string[];
}

const DEFAULT_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

/**
 * Middleware for handling Cross-Origin Resource Sharing (CORS).
 */
export const cors = (options: CorsOptions = {}): Middleware => {
  const {
    origin = '*',
    allowMethods = DEFAULT_METHODS,
    allowHeaders = [],
    maxAge,
    credentials,
    exposeHeaders,
    includes,
    excludes,
  } = options;

  return composeMiddleware(async (ctx, next) => {
    const requestOrigin = ctx.header('Origin');
    let allowedOrigin: string | undefined;

    if (origin === '*') {
      allowedOrigin = '*';
    } else if (typeof origin === 'string') {
      allowedOrigin = origin;
    } else if (Array.isArray(origin) && requestOrigin && origin.includes(requestOrigin)) {
      allowedOrigin = requestOrigin;
    }

    // Apply CORS headers
    if (allowedOrigin) ctx.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    if (allowMethods.length) ctx.headers.set('Access-Control-Allow-Methods', allowMethods.join(', '));
    if (allowHeaders.length) ctx.headers.set('Access-Control-Allow-Headers', allowHeaders.join(', '));
    if (maxAge) ctx.headers.set('Access-Control-Max-Age', String(maxAge));
    if (credentials) ctx.headers.set('Access-Control-Allow-Credentials', 'true');
    if (exposeHeaders?.length) ctx.headers.set('Access-Control-Expose-Headers', exposeHeaders.join(', '));

    // Handle preflight
    if (ctx.request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: ctx.headers });
    }

    // Ensure Vary header if origin is not wildcard
    if (allowedOrigin && allowedOrigin !== '*') {
      const vary = ctx.headers.get('Vary');
      ctx.headers.set('Vary', vary ? `${vary}, Origin` : 'Origin');
    }

    return next();
  })({
    priority: Priority.MONITOR,
    includes,
    excludes,
  });
};
