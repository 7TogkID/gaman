import {
	IS_MIDDLEWARE_FACTORY,
	IS_MIDDLEWARE_HANDLER,
	MIDDLEWARE_CONFIG_METADATA,
} from '@gaman/common/contants.js';
import {
	DefaultMiddlewareOptions,
	MiddlewareHandler,
} from '@gaman/common/types/index.js';
import { registerMiddlewares } from '@gaman/core/registry.js';

export function autoComposeMiddleware<Config = any>(
	mh: MiddlewareHandler,
	defaultConfig?: Config & DefaultMiddlewareOptions,
): MiddlewareHandler {
	const handler = composeMiddleware(mh, defaultConfig)();
	registerMiddlewares(handler);
	return handler;
}

export function composeMiddleware<Config = any>(
	mh: MiddlewareHandler,
	defaultConfig?: Config & DefaultMiddlewareOptions,
): (customConfig?: Config & DefaultMiddlewareOptions) => MiddlewareHandler {
	const factory = (customConfig?: Config & DefaultMiddlewareOptions) => {
		const handler: MiddlewareHandler = async (ctx, next) => {
			return await mh(ctx, next);
		};
		Object.defineProperty(handler, IS_MIDDLEWARE_HANDLER, {
			value: true,
			writable: false,
			enumerable: false,
		});
		Object.defineProperty(handler, MIDDLEWARE_CONFIG_METADATA, {
			value: {
				...defaultConfig,
				...customConfig,
			},
			writable: false,
			enumerable: false,
		});
		return handler;
	};
	Object.defineProperty(factory, IS_MIDDLEWARE_FACTORY, {
		value: true,
		writable: false,
		enumerable: false,
	});
	return factory;
}
