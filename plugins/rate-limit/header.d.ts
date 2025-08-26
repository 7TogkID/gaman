/**
 * Reference code
 * https://github.com/express-rate-limit/express-rate-limit/blob/main/source/headers.ts
 */
import { RateLimitInfo } from './types';
import { Response } from '@gaman/core/response';
export declare const SUPPORTED_DRAFT_VERSIONS: readonly ["draft-6", "draft-7", "draft-8"];
/**
 * Sets `X-RateLimit-*` headers on a response.
 */
export declare const setLegacyHeaders: (res: Response, info: RateLimitInfo) => void;
/**
 * Sets `RateLimit-*`` headers based on the sixth draft of the IETF specification.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-06.
 *
 * @param res {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
export declare const setDraft6Headers: (res: Response, info: RateLimitInfo, windowMs: number) => void;
/**
 * Sets `RateLimit` & `RateLimit-Policy` headers based on the seventh draft of the spec.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-07.
 *
 * @param res {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
export declare const setDraft7Headers: (res: Response, info: RateLimitInfo, windowMs: number) => void;
/**
 * Sets `RateLimit` & `RateLimit-Policy` headers based on the eighth draft of the spec.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-08.
 *
 * @param res {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 * @param name {string} - The name of the quota policy.
 * @param key {string} - The unique string identifying the client.
 */
export declare const setDraft8Headers: (res: Response, info: RateLimitInfo, windowMs: number, name: string, key: string) => void;
/**
 * Sets the `Retry-After` header.
 *
 * @param res {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
export declare const setRetryAfterHeader: (res: Response, info: RateLimitInfo, windowMs: number) => void;
