/**
 * @module
 * CORS Middleware for Gaman.
 * Implements Cross-Origin Resource Sharing (CORS) with customizable options.
 */
import { composeMiddleware } from '@gaman/core';
import { Response } from '@gaman/core/response.js';
/**
 * Middleware for handling Cross-Origin Resource Sharing (CORS).
 * @param options - The options for configuring CORS behavior.
 * @returns Middleware function for handling CORS.
 */
export const cors = (options) => {
    const { origin = '*', allowMethods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowHeaders = [], maxAge, credentials, exposeHeaders, } = options;
    return composeMiddleware(async (ctx, next) => {
        const requestOrigin = ctx.header('Origin');
        // Determine allowed origin
        let allowedOrigin = '*';
        if (typeof origin === 'string') {
            allowedOrigin = origin;
        }
        else if (Array.isArray(origin) && origin.includes(requestOrigin || '')) {
            allowedOrigin = requestOrigin;
        }
        else {
            allowedOrigin = undefined;
        }
        // Set CORS headers
        const headers = {};
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
        if (ctx.request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers });
        }
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
        if (allowedOrigin && allowedOrigin !== '*') {
            const existingVary = ctx.headers.get('Vary');
            ctx.headers.set('Vary', existingVary ? `${existingVary}, Origin` : 'Origin');
        }
        // Handle preflight request
        if (ctx.request.method === 'OPTIONS') {
            return new Response(undefined, { status: 204, headers });
        }
        for (const [key, value] of Object.entries(headers)) {
            if (!ctx.headers.has(key)) {
                ctx.headers.set(key, value);
            }
        }
        return await next();
    });
};
