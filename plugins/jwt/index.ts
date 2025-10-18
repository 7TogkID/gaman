import {
	Context,
	DefaultMiddlewareOptions,
	sign,
	verify,
	Priority,
} from '@gaman/common';
import { composeMiddleware } from '@gaman/core';
import { Response } from '@gaman/core/response.js';

export interface JwtOptions extends DefaultMiddlewareOptions {
	secret: string;
	cookie?: string;
	header?: string;
	expiresIn?: string | number;
	required?: boolean;
}

declare global {
	namespace Gaman {
		interface Context {
			jwt: {
				sign: (payload: object, expiresIn?: string | number) => string;
				verify: <T>(token: string) => T | null;
				user: any;
			};
		}
	}
}

const DEFAULT_JWT_EXPIRATION = 6000;

export const jwt = (options: JwtOptions) => {
	const signToken = (payload: object, expiresIn?: string | number) => {
		const expire = expiresIn || options.expiresIn || DEFAULT_JWT_EXPIRATION;
		const expireNumber = Number(expire);

		const expireTime = Number.isNaN(expireNumber)
			? DEFAULT_JWT_EXPIRATION
			: expireNumber;

		return sign(payload, options.secret, expireTime);
	};

	const verifyToken = <T>(token: string) => {
		return verify<T>(token, options.secret);
	};

	const middleware = composeMiddleware(async (ctx, next) => {
		let token: string | undefined;

		if (options.cookie && ctx.cookies.get(options.cookie)?.value) {
			token = ctx.cookies.get(options.cookie)?.value;
		} else if (options.header) {
			const authHeader = ctx.request.headers.get(options.header);
			if (authHeader) {
				const parts = authHeader.split(' ');
				if (parts.length === 2 && parts[0] === 'Bearer') {
					token = parts[1];
				}
			}
		}

		let user = null;
		if (token) {
			user = verifyToken(token);
		}

		if (!ctx.jwt) {
			Object.defineProperty(ctx, 'jwt', {
				value: {
					sign: signToken,
					verify: verifyToken,
					user,
					required: options.required ?? false,
				},
				writable: false,
			});
		}

		if (options.required && !user) {
			return Response.json({ message: 'Unauthorized' }, { status: 401 });
		}

		return await next();
	});

	return middleware({
		priority: options.priority || Priority.HIGH,
		includes: options.includes,
		excludes: options.excludes,
	});
};
