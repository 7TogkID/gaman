/**
 * Reference code
 * https://github.com/express-rate-limit/express-rate-limit/blob/main/source/headers.ts
 */

import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { RateLimitInfo } from './types.js';
import { GamanHeader } from '@gaman/core';

export const SUPPORTED_DRAFT_VERSIONS = [
	'draft-6',
	'draft-7',
	'draft-8',
] as const;

/**
 * Returns the number of seconds left for the window to reset. Uses `windowMs`
 * in case the store doesn't return a `resetTime`.
 *
 * @param ttl {number | undefined} - The window length.
 * @param resetTime {Date | undefined} - The timestamp at which the store window resets.
 */
const getResetSeconds = (ttl: number, resetTime?: Date): number => {
	let resetSeconds: number;
	if (resetTime) {
		const deltaSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
		resetSeconds = Math.max(0, deltaSeconds);
	} else {
		// This isn't really correct, but the field is required by the spec in `draft-7`,
		// so this is the best we can do. The validator should have already logged a
		// warning by this point.
		resetSeconds = Math.ceil(ttl / 1000);
	}

	return resetSeconds;
};

/**
 * Returns the hash of the identifier, truncated to 12 bytes, and then converted
 * to base64 so that it can be used as a 16 byte partition key. The 16-byte limit
 * is arbitrary, and follows from the examples given in the 8th draft.
 *
 * @param key {string} - The identifier to hash.
 */
const getPartitionKey = (key: string): string => {
	const hash = createHash('sha256');
	hash.update(key);

	const partitionKey = hash.digest('hex').slice(0, 12);
	return Buffer.from(partitionKey).toString('base64');
};

/**
 * Sets `X-RateLimit-*` headers on a response.
 */
export const setLegacyHeaders = (
	header: GamanHeader,
	info: RateLimitInfo,
): void => {
	header.set('X-RateLimit-Limit', info.limit.toString());
	header.set('X-RateLimit-Remaining', info.remaining.toString());

	// If we have a resetTime, also provide the current date to help avoid
	// issues with incorrect clocks.
	if (info.reset instanceof Date) {
		header.set('Date', new Date().toUTCString());
		header.set(
			'X-RateLimit-Reset',
			Math.ceil(info.reset.getTime() / 1000).toString(),
		);
	}
};

/**
 * Sets `RateLimit-*`` headers based on the sixth draft of the IETF specification.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-06.
 *
 * @param header {GamanHeader} - The gaman header object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
export const setDraft6Headers = (
	header: GamanHeader,
	info: RateLimitInfo,
	windowMs: number,
): void => {
	const windowSeconds = Math.ceil(windowMs / 1000);
	const resetSeconds = getResetSeconds(windowMs, info.reset);

	header.set('RateLimit-Policy', `${info.limit};w=${windowSeconds}`);
	header.set('RateLimit-Limit', info.limit.toString());
	header.set('RateLimit-Remaining', info.remaining.toString());

	// Set this header only if the store returns a `resetTime`.
	header.set('RateLimit-Reset', resetSeconds.toString());
};

/**
 * Sets `RateLimit` & `RateLimit-Policy` headers based on the seventh draft of the spec.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-07.
 *
 * @param header {GamanHeader} - The gaman header object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
export const setDraft7Headers = (
	header: GamanHeader,
	info: RateLimitInfo,
	windowMs: number,
): void => {
	const windowSeconds = Math.ceil(windowMs / 1000);
	const resetSeconds = getResetSeconds(windowMs, info.reset);

	header.set('RateLimit-Policy', `${info.limit};w=${windowSeconds}`);
	header.set(
		'RateLimit',
		`limit=${info.limit}, remaining=${info.remaining}, reset=${resetSeconds}`,
	);
};

/**
 * Sets `RateLimit` & `RateLimit-Policy` headers based on the eighth draft of the spec.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-08.
 *
 * @param header {GamanHeader} - The gaman header object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 * @param name {string} - The name of the quota policy.
 * @param key {string} - The unique string identifying the client.
 */
export const setDraft8Headers = (
	header: GamanHeader,
	info: RateLimitInfo,
	windowMs: number,
	name: string,
	key: string,
): void => {
	const windowSeconds = Math.ceil(windowMs / 1000);
	const resetSeconds = getResetSeconds(windowMs, info.reset);
	const partitionKey = getPartitionKey(key);

	const _header = `r=${info.remaining}; t=${resetSeconds}`;
	const policy = `q=${info.limit}; w=${windowSeconds}; pk=:${partitionKey}:`;

	header.set('RateLimit', `"${name}"; ${_header}`);
	header.set('RateLimit-Policy', `"${name}"; ${policy}`);
};

/**
 * Sets the `Retry-After` header.
 *
 * @param header {GamanHeader} - The gaman header object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param ttl {number} - The window length.
 */
export const setRetryAfterHeader = (
	header: GamanHeader,
	info: RateLimitInfo,
	ttl: number,
): void => {
	const resetSeconds = getResetSeconds(ttl, info.reset);
	header.set('Retry-After', resetSeconds.toString());
};
