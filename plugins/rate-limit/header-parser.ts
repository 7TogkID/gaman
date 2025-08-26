/**
 * Reference code
 * https://github.com/express-rate-limit/ratelimit-header-parser/blob/main/source/ratelimit-header-parser.ts
 */

import { Context } from '@gaman/core/types';
import { ParseRateLimitOptions, RateLimitInfo } from './types';

export function parseRateLimit(
	context: Context,
	options?: ParseRateLimitOptions,
): RateLimitInfo | undefined {
	let headers: Record<string, string> = {};

	for (const [key, value] of context.headers.entries()) {
		headers[key] = Array.isArray(value) ? value.join(',') : value;
	}

	if (!headers) return;

	return parseHeaders(headers, options);
}

function parseHeaders(
	headers: Record<string, string>,
	options?: ParseRateLimitOptions,
): RateLimitInfo | undefined {
	const combined = getHeader(headers, 'ratelimit');
	if (combined) {
		return parseCombinedHeader(combined);
	}

	// Cari prefix dari header rate limit
	let prefix: string | undefined;

	if (getHeader(headers, 'ratelimit-remaining')) prefix = 'ratelimit-';
	else if (getHeader(headers, 'x-ratelimit-remaining')) prefix = 'x-ratelimit-';
	else if (getHeader(headers, 'x-rate-limit-remaining'))
		prefix = 'x-rate-limit-';

	if (!prefix) return undefined;

	const limit = toInt(getHeader(headers, `${prefix}limit`));
	const used =
		toInt(getHeader(headers, `${prefix}used`)) ??
		toInt(getHeader(headers, `${prefix}observed`));
	const remaining = toInt(getHeader(headers, `${prefix}remaining`));

	const rawReset = getHeader(headers, `${prefix}reset`);
	const reset = parseReset(rawReset, options?.reset);

	return {
		limit: isNaN(limit) ? used + remaining : limit,
		used: isNaN(used) ? limit - remaining : used,
		remaining,
		reset,
		key: '',
	};
}

function parseCombinedHeader(header: string): RateLimitInfo {
	const limit = toInt(/limit\s*=\s*(\d+)/i.exec(header)?.[1]);
	const remaining = toInt(/remaining\s*=\s*(\d+)/i.exec(header)?.[1]);
	const resetSeconds = toInt(/reset\s*=\s*(\d+)/i.exec(header)?.[1]);

	return {
		limit,
		used: limit - remaining,
		remaining,
		reset: secondsToDate(resetSeconds),
		key: '',
	};
}

function parseReset(
	input: string | undefined,
	type?: string,
): Date | undefined {
	if (!input) return;

	const resetNumber = toInt(input);

	switch (type) {
		case 'date':
			return new Date(input);
		case 'unix':
			return new Date(resetNumber * 1000);
		case 'milliseconds':
			return new Date(resetNumber);
		case 'seconds':
			return secondsToDate(resetNumber);
		default:
			if (/[a-z]/i.test(input)) return new Date(input);
			if (resetNumber > 1e9) return new Date(resetNumber * 1000);
			return secondsToDate(resetNumber);
	}
}

function getHeader(
	headers: Record<string, string> | { get?: (key: string) => string | null },
	name: string,
): string | undefined {
	if ('get' in headers && typeof headers.get === 'function') {
		return headers.get(name) ?? undefined;
	}

	const lowerName = name.toLowerCase();
	return Object.entries(headers).find(
		([key]) => key.toLowerCase() === lowerName,
	)?.[1];
}

function toInt(input?: string): number {
	if (typeof input === 'number') return input;
	if (!input) return NaN;
	return parseInt(input, 10);
}

function secondsToDate(seconds: number): Date | undefined {
	if (isNaN(seconds)) return;
	const d = new Date();
	d.setSeconds(d.getSeconds() + seconds);
	return d;
}
