import * as crypto from 'node:crypto';
import { Context, sign, verify } from '@gaman/common';
import { SessionOptions } from './index.js';

export class Session {
	constructor(private ctx: Context, private options: SessionOptions) {}

	private get cookieName() {
		return this.options.defaultName
			? `gaman-session-${this.options.defaultName}`
			: 'gaman-session-sid';
	}

	private resolveCookieName(name?: string) {
		return name ? `gaman-session-${name}` : this.cookieName;
	}

	/**
	 * ? Set session data
	 */
	async set(payload: any, name?: string, maxAge?: number): Promise<void> {
		const cookieName = this.resolveCookieName(name);
		name = name || 'sid';

		const ttl = maxAge || this.options.maxAge || 86400;

		if (this.options.store) {
			const sid = crypto.randomBytes(32).toString('hex');
			await this.options.store.set({
				sid,
				name,
				cookieName,
				maxAge: ttl,
				payload,
			});
			this.ctx.cookies.set(cookieName, sid, {
				...this.options,
				maxAge: ttl,
			});
		} else {
			if (!this.options.secret) {
				throw new Error('Session secret required in stateless mode');
			}
			const token = sign(payload, this.options.secret, ttl);
			this.ctx.cookies.set(cookieName, token, {
				...this.options,
				maxAge: ttl,
			});
		}
	}

	/**
	 * ? Get session data
	 */
	async get<T = any>(name?: string): Promise<T | null> {
		const cookieName = this.resolveCookieName(name);
		name = name || 'sid';

		const value = this.ctx.cookies.get(cookieName)?.value;
		if (!value) return null;

		if (this.options.store) {
			return (
				(await this.options.store.get({
					cookieName,
					name,
					sid: value,
				})) ?? null
			);
		} else {
			if (!this.options.secret) return null;
			return verify<T>(value, this.options.secret) ?? null;
		}
	}

	/**
	 * ? Delete session
	 */
	async delete(name?: string): Promise<void> {
		const cookieName = this.resolveCookieName(name);
		name = name || 'sid';

		const value = this.ctx.cookies.get(cookieName)?.value;
		this.ctx.cookies.delete(cookieName, this.options);

		if (this.options.store && value) {
			await this.options.store.delete({
				cookieName,
				name,
				sid: value,
			});
		}
	}
}
