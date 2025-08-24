import {
	IS_MIDDLEWARE_HANDLER,
	MIDDLEWARE_CONFIG_METADATA,
} from '@gaman/common/contants';
import { Priority } from '@gaman/common/utils';
import type { Context, NextResponse } from '@gaman/core/types';

export type MiddlewareHandler = (
	ctx: Context,
	next: () => Promise<NextResponse>,
) => NextResponse;

export type DefaultMiddlewareOptions = {
	/**
	 * @EN If the `Priority` is higher then it will be executed first, and last to change the final response, if it is lower then the opposite is true.
	 * @ID Jika `Priority` lebih tinggi maka dia akan dijalankan paling awal, dan paling akhir untuk mengubah response akhir, kalau paling rendah maka sebaliknya.
	 */
	priority?: Priority;
	/**
	 * @EN `includes` to set which route the middleware will be run on.
	 * @ID `includes` untuk mengatur di route mana middleware akan di jalankan.
	 */
	includes?: string[];
	/**
	 * @EN `includes` to set on which routes the middleware will not be executed.
	 * @ID `includes` untuk mengatur di route mana middleware tidak akan di jalankan.
	 */
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
