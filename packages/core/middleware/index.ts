import {
	IS_MIDDLEWARE_HANDLER,
	MIDDLEWARE_CONFIG_METADATA,
} from '@gaman/common/contants';
import {
	DefaultMiddlewareOptions,
	MiddlewareHandler,
} from '@gaman/common/types';

export function composeMiddleware<Config = any>(
	mh: MiddlewareHandler,
	defaultConfig?: Config & DefaultMiddlewareOptions,
): (customConfig?: Config & DefaultMiddlewareOptions) => MiddlewareHandler {
	return (customConfig?: Config & DefaultMiddlewareOptions) => {
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
}
