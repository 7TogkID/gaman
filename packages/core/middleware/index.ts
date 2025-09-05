import {
	IS_MIDDLEWARE_FACTORY,
	IS_MIDDLEWARE_HANDLER,
} from '@gaman/common/contants.js';
import {
	DefaultMiddlewareOptions,
	Middleware,
	MiddlewareHandler,
	MiddlewareOptions,
} from '@gaman/common/types/index.js';
import { registerMiddlewares } from '@gaman/core/registry.js';
import { match } from 'path-to-regexp';

export function autoComposeMiddleware<Config = any>(
	mh: MiddlewareHandler,
	defaultConfig?: Config & DefaultMiddlewareOptions,
): Middleware {
	const mw = composeMiddleware(mh, defaultConfig)();
	registerMiddlewares(mw);
	return mw;
}

export function composeMiddleware<Config = any>(
	mh: MiddlewareHandler,
	defaultConfig?: Config & DefaultMiddlewareOptions,
): (customConfig?: Config & DefaultMiddlewareOptions) => Middleware {
	const factory = (
		customConfig?: Config & DefaultMiddlewareOptions,
	): Middleware => {
		const handler: MiddlewareHandler = async (ctx, next) => {
			return await mh(ctx, next);
		};
		const config = {
			...defaultConfig,
			...customConfig,
		};
		const useable_config: MiddlewareOptions = {
			priority: config.priority || 'normal',
			includes: [],
			excludes: [],
		};

		// ? add match includes
		for (const path of config.includes || []) {
			if (typeof path === 'string') {
				useable_config.includes.push({
					path,
					methods: [],
					match: match(path),
				});
			} else {
				useable_config.includes.push({
					path: path.path,
					methods: path.method
						? Array.isArray(path.method)
							? path.method
							: [path.method]
						: [],
					match: match(path.path),
				});
			}
		}

		// ? add match exclues
		for (const path of config.excludes || []) {
			if (typeof path === 'string') {
				useable_config.excludes.push({
					path,
					methods: [],
					match: match(path),
				});
			} else {
				useable_config.excludes.push({
					path: path.path,
					methods: path.method
						? Array.isArray(path.method)
							? path.method
							: [path.method]
						: [],
					match: match(path.path),
				});
			}
		}

		Object.defineProperty(handler, IS_MIDDLEWARE_HANDLER, {
			value: true,
			writable: false,
			enumerable: false,
		});
		return {
			handler,
			config: useable_config,
		};
	};
	Object.defineProperty(factory, IS_MIDDLEWARE_FACTORY, {
		value: true,
		writable: false,
		enumerable: false,
	});
	return factory;
}
