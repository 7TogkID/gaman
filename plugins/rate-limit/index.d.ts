/**
 * @module
 * Rate Limit Integration for GamanJS.
 *
 * Inspired by https://github.com/express-rate-limit/ratelimit-header-parser
 */
import { Context } from '@gaman/core/types';
export interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string;
    keyGenerator?: (ctx: Context) => string;
}
export declare const rateLimit: (opts?: RateLimitOptions) => any;
