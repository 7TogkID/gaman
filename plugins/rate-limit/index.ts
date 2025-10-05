import { composeMiddleware, composeStore, Response } from '@gaman/core';
import {
	Context,
	DefaultMiddlewareOptions,
	Priority,
	Store,
} from '@gaman/common';
import { RateLimitInfo, RateLimitOptions, RateMemoryEntry } from './types.js';
import { ipKeyGenerator } from './helper.js';
import {
	setLegacyHeaders,
	setDraft6Headers,
	setDraft7Headers,
	setDraft8Headers,
	setRetryAfterHeader,
} from './header.js';

const defaultOptions: Required<Omit<RateLimitOptions, 'store'>> = {
	ttl: 60000,
	limit: 5,
	errorMessage: () =>
		Response.tooManyRequests({
			message: 'Too many requests, please try again later.',
		}),
	keyGenerator: (_, ctx) => {
		const ip = defaultOptions.trustProxy
			? ctx.header('x-forwarded-for')?.toString().split(',')[0].trim() ||
			  ctx.request.ip
			: ctx.request.ip;
		return ipKeyGenerator(ip, defaultOptions.ipv6Subnet);
	},
	draft: 'legacy',
	standardHeaders: true,
	legacyHeaders: false,
	ipv6Subnet: 56,
	trustProxy: false,
	onLimitReached: async () => {},
	onReceive: async () => {},
};

export const rateLimit = (
	ops?: RateLimitOptions & DefaultMiddlewareOptions,
) => {
	const options = Object.assign({}, defaultOptions, ops);

	const store: Store<string, RateMemoryEntry> =
		options.store ??
		composeStore(() => {
			const memoryStore = new Map<string, RateMemoryEntry>();
			return {
				async get(key) {
					return memoryStore.get(key);
				},
				async set(key, value) {
					memoryStore.set(key, value);
				},
				async has(key) {
					return memoryStore.has(key);
				},
				async delete(key) {
					memoryStore.delete(key);
				},
			};
		})();

	const middleware = composeMiddleware(async (ctx: Context, next) => {
		const key =
			(await options.keyGenerator(options, ctx)) ??
			(await defaultOptions.keyGenerator(options, ctx));

		const now = Date.now();
		const ttl = options.ttl || 60_600;
		const limit = options.limit || 5;

		let entry = await store.get(key);
		if (!entry || entry.resetTime <= now) {
			entry = { count: 0, resetTime: now + ttl };
			store.set(key, entry);
		}
		entry.count++;

		const info: RateLimitInfo = {
			limit,
			used: entry.count,
			remaining: Math.max(0, limit - entry.count),
			reset: new Date(entry.resetTime),
			key,
		};
		options.onReceive?.(info, ctx);

		/**
		 * todo: set Retry header
		 * ? biar client tau kapan bisa request lagi
		 */
		setRetryAfterHeader(ctx.headers, info, ttl);

		// todo: set draft header biar tau data rate-limit sperti limit, ttl dll
		if (options.legacyHeaders) setLegacyHeaders(ctx.headers, info);
		if (options.standardHeaders) {
			switch (options.draft) {
				case 'draft-6':
					setDraft6Headers(ctx.headers, info, ttl);
					break;
				case 'draft-7':
					setDraft7Headers(ctx.headers, info, ttl);
					break;
				case 'draft-8':
					setDraft8Headers(ctx.headers, info, ttl, 'ratelimit', key);
					break;
			}
		}

		// todo: Jika kena request dah lebih di atas limit yang di atur maka kirim respon error
		if (entry.count > limit) {
			await options.onLimitReached(info, ctx);
			return typeof options.errorMessage === 'function'
				? await options.errorMessage(ctx)
				: Response.tooManyRequests({
						message:
							typeof options.errorMessage === 'string'
								? options.errorMessage
								: 'Too many requests, please try again later.',
				  });
		}

		return await next();
	});

	return middleware({
		priority: Priority.MONITOR,
		includes: options.includes,
		excludes: options.excludes,
	});
};
