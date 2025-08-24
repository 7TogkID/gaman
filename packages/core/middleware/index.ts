import {
	IS_MIDDLEWARE_SYMBOL,
	MIDDLEWARE_CONFIG_METADATA,
} from '@gaman/common/contants';
import type { Context, NextResponse } from '@gaman/core/types';

export type MiddlewareHandler = (
	ctx: Context,
	next: () => Promise<NextResponse>,
) => NextResponse;

export type DefaultMiddlewareOptions = {
	includes?: string[];
	excludes?: string[];
};

export function composeMiddleware<Config = any>(
	mh: MiddlewareHandler,
	defaultConfig?: Config & DefaultMiddlewareOptions,
): (customConfig?: Config & DefaultMiddlewareOptions) => MiddlewareHandler {
	return (customConfig?: Config & DefaultMiddlewareOptions) => {
		const handler: MiddlewareHandler = async (ctx, next) => {
			return await mh(ctx, next);
		};
		(handler as any)[IS_MIDDLEWARE_SYMBOL] = true;
		(handler as any)[MIDDLEWARE_CONFIG_METADATA] = {
			...defaultConfig,
			...customConfig,
		};
		return handler;
	};
}
