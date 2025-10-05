import { Context, Store } from '@gaman/common';
import { Response } from '@gaman/core';

export interface RateLimitInfo {
	limit: number;
	used: number;
	remaining: number;
	key: string;
	reset: Date | undefined;
}

export interface ParseRateLimitOptions {
	reset?: 'date' | 'unix' | 'seconds' | 'milliseconds';
}

export type RateLimitKeyGeneratorHandler = (
	options: RateLimitOptions,
	ctx: Context,
) => string | Promise<string>;

export type RateLimitErrorMessageHandler = (
	ctx: Context,
) => Response | Promise<Response>;

export interface RateLimitOptions {
	/**
	 * @ID Waktu window rate limit (ms): (default: 60_000 (1 menit)).
	 * @EN Default window rate limit time (ms): (default: 60_000 (1 minute)).
	 */
	ttl?: number;

	/**
	 * @ID Jumlah maksimum request yang diizinkan per client atau key. (default: 60)
	 * @EN The maximum number of requests allowed per client or key. (default: 60)
	 */
	limit?: number;

	/**
	 * @ID Fungsi custom untuk generate key klien dari Context (misal IP, token, userId, dsb).
	 * @EN Custom function to generate client key from Context (e.g. IP, token, userId, etc.).
	 */
	keyGenerator?: RateLimitKeyGeneratorHandler;

	/**
	 * @ID Pesan error saat rate limit tercapai.
	 * @EN Error message when rate limit is reached.
	 */
	errorMessage?: string | object | Array<any> | RateLimitErrorMessageHandler;

	/**
	 * @ID
	 * ```diff
	 * + Draft spesifikasi HTTP rate limit headers yang dipakai.
	 * +  - "legacy" → X-RateLimit-*
	 * +  - "draft-6" | "draft-7" | "draft-8"
	 * + Default: "legacy"
	 * ```
	 *
	 * @EN
	 * ```diff
	 * + Draft specification for the HTTP rate limit headers used.
	 * + - "legacy" → X-RateLimit-*
	 * + - "draft-6" | "draft-7" | "draft-8"
	 * + Default: "legacy"
	 * ```
	 */
	draft?: 'legacy' | 'draft-6' | 'draft-7' | 'draft-8';

	/**
	 * @ID Apakah header rate limit harus dikirim? (default: true)
	 * @EN Should a rate limit header be sent? (default: true)
	 */
	standardHeaders?: boolean;

	/**
	 * @ID Apakah header lama (X-RateLimit-*) masih dikirim? (default: false)
	 * @EN Are the old headers (X-RateLimit-*) still sent? (default: false)
	 */
	legacyHeaders?: boolean;

	/**
	 * @ID Subnet mask untuk IPv6 `ini tidak akan bekerja otomatis jika pakai keyGenerator kustom`. (default: 56)
	 * @EN Subnet mask for IPv6 `this will not work automatically if using custom keyGenerator`. (default: 56)
	 */
	ipv6Subnet?: number | false;

	/**
	 * @ID Callback opsional kalau user kena rate limit (biar bisa logging / metrics).
	 * @EN Optional callback if user is rate limited (so logging/metrics can be done).
	 */
	onLimitReached?: (info: RateLimitInfo, ctx: Context) => void | Promise<void>;

	/**
	 * @ID Callback opsional kalau ada request (biar bisa logging / metrics).
	 * @EN Optional callback if there is a request (so that logging / metrics can be done).
	 */
	onReceive?: (info: RateLimitInfo, ctx: Context) => void | Promise<void>;

	/**
	 * @ID Menerima ip klien di header `X-Forwarded-For` dari proxy seperti apache, nginx dll, (default: false)
	 * @EN Receive client ip in `X-Forwarded-For` header from proxies like apache, nginx etc, (default: false)
	 */
	trustProxy?: boolean;
	/**
	 * @ID Store backend seperti Redis, Memcached, dll.
	 * @EN Store backends like Redis, Memcached, etc.
	 */
	store?: Store<string, RateMemoryEntry>;
}

export interface RateMemoryEntry {
	count: number;
	resetTime: number;
}
