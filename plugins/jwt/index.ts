import {
	DefaultMiddlewareOptions,
	sign,
	verify,
	Priority,
} from '@gaman/common';
import { composeMiddleware } from '@gaman/core';
import { Response } from '@gaman/core/response.js';

/**
 * Represents the options for the JWT middleware.
 */
export interface JwtOptions extends DefaultMiddlewareOptions {
	/**
	 * The secret key used to sign and verify the JWT.
	 */
	secret: string;
	/**
	 * The name of the cookie to store the JWT in.
	 * If this is provided, the middleware will look for the JWT in the cookies.
	 */
	cookie?: string;
	/**
	 * The name of the header to look for the JWT in.
	 * If this is provided, the middleware will look for the JWT in the headers.
	 * The header should be in the format "Bearer <token>".
	 */
	header?: string;
	/**
	 * The expiration time for the JWT.
	 * This can be a string (e.g., "1h", "1d") or a number in seconds.
	 * @default 6000
	 */
	expiresIn?: string | number;
	/**
	 * Whether the JWT is required for the route.
	 * If this is true and the JWT is not present or invalid, the middleware will return a 401 Unauthorized response.
	 * @default false
	 */
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

/**
 * A middleware for handling JSON Web Tokens (JWT).
 * This middleware adds a `jwt` object to the context, which contains methods for signing and verifying JWTs.
 * It also checks for a JWT in the cookies or headers and populates `ctx.jwt.user` with the decoded payload.
 *
 * @param options - The options for the JWT middleware.
 * @returns A middleware function.
 *
 * @example
 * ```ts
 * import { Gaman } from '@gaman/core';
 * import { jwt } from '@gaman/jwt';
 *
 * const app = new Gaman();
 *
 * app.use(jwt({ secret: 'your-secret-key' }));
 *
 * app.get('/profile', (ctx) => {
 *   if (ctx.jwt.user) {
 *     return ctx.json({ user: ctx.jwt.user });
 *   } else {
 *     return ctx.json({ message: 'Unauthorized' }, 401);
 *   }
 * });
 * ```
 */
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
