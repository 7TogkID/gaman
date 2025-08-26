/**
 * @module
 * Rate Limit Integration for GamanJS.
 *
 * Inspired by https://github.com/express-rate-limit/ratelimit-header-parser
 */
import { defineIntegration } from '@gaman/core/integration';
const defaultOptions = {
    windowMs: 60000,
    max: 60,
    message: 'Too many requests, please try again later.',
    keyGenerator: (ctx) => ctx.req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
        ctx.req.socket.remoteAddress ||
        'unknown',
};
export const rateLimit = (opts) => {
    const options = { ...defaultOptions, ...opts };
    const memoryStore = new Map();
    return defineIntegration((app) => ({
        name: 'rate-limit',
        priority: 'high',
        async onRequest(ctx) {
            const key = options.keyGenerator(ctx);
            const now = Date.now();
            let entry = memoryStore.get(key);
            if (!entry || entry.resetTime < now) {
                entry = {
                    count: 1,
                    resetTime: now + options.windowMs,
                };
                memoryStore.set(key, entry);
            }
            else {
                entry.count += 1;
            }
            const remaining = options.max - entry.count;
            // Set Draft IETF-style RateLimit headers
            ctx.res.setHeader('RateLimit', `${options.max};window=${Math.floor(options.windowMs / 1000)}`);
            ctx.res.setHeader('RateLimit-Remaining', Math.max(0, remaining).toString());
            ctx.res.setHeader('RateLimit-Reset', Math.floor(entry.resetTime / 1000).toString());
            if (entry.count > options.max) {
                return ctx.res.status(429).text(options.message);
            }
        },
    }));
};
