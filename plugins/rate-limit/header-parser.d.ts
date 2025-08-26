/**
 * Reference code
 * https://github.com/express-rate-limit/ratelimit-header-parser/blob/main/source/ratelimit-header-parser.ts
 */
import { Context } from '@gaman/core/types';
import { ParseRateLimitOptions, RateLimitInfo } from './types';
export declare function parseRateLimit(context: Context, options?: ParseRateLimitOptions): RateLimitInfo | undefined;
