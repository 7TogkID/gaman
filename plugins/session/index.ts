/**
 * @module
 * GamanJS session integration.
 */

import { composeMiddleware, GamanCookieSetOptions } from '@gaman/core/index.js';
import { Session } from './session.js';
import { Context, Priority } from '@gaman/common/index.js';

declare global {
	namespace Gaman {
		interface Context {
			session: Session;
		}
	}
}
export {};

export interface SessionStoreData {
	sid: string;
	cookieName: string;
	name: string;
	payload: any;
	maxAge: number;
}

export interface SessionStoreListener {
	get: (
		data: Pick<SessionStoreData, 'cookieName' | 'name' | 'sid'>,
	) => Promise<any>;
	set: (data: SessionStoreData) => Promise<void>;
	delete: (
		data: Pick<SessionStoreData, 'cookieName' | 'name' | 'sid'>,
	) => Promise<void>;
}

export interface SessionOptions
	extends Omit<GamanCookieSetOptions, 'maxAge' | 'expires'> {
	secret?: string;
	store?: SessionStoreListener;
	maxAge?: number;
	defaultName?: string;
	crossSite?: boolean;
}

function detectCookieOptions(
	ctx: Context,
	base: SessionOptions,
): SessionOptions {
	const origin = ctx.headers.get('origin') || '';
	const host = ctx.headers.get('host') || '';
	const isCrossSite = origin && !origin.includes(host);

	if (isCrossSite) {
		// ! Cross origin → wajib None + Secure
		return {
			sameSite: 'none',
			secure: true,
			...base,
		};
	} else {
		// ! Same origin → boleh default Lax
		return {
			sameSite: base.sameSite ?? 'lax',
			secure: process.env.NODE_ENV === 'production',
			...base,
		};
	}
}

/**
 * GamanJS session integration handler.
 *
 * Automatically initializes the correct store based on driver config.
 * Logs missing dependencies for optional drivers and gracefully exits.
 */
export function session(options: SessionOptions = {}) {
	const cross = options.crossSite === true;

  const ops: SessionOptions = {
    maxAge: 86400,
    secret: process.env.SESSION_SECRET_KEY,
    defaultName: 'sid',
    httpOnly: true,
    path: '/',

    // otomatis
    secure: cross || process.env.NODE_ENV === 'production',
    sameSite: cross
      ? 'none'
      : (options.sameSite ?? 'lax'),

    ...options,
  };

	const middleware = composeMiddleware((ctx, next) => {
		const dynamicOps = detectCookieOptions(ctx, ops);

		Object.defineProperty(ctx, 'session', {
			value: new Session(ctx, dynamicOps),
			writable: false,
		});
		return next();
	});

	return middleware({
		priority: Priority.MONITOR,
	});
}
