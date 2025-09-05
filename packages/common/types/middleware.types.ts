import { Priority } from '@gaman/common/utils/index.js';
import { Context } from '@gaman/common/types/index.js';
import { Response } from '@gaman/core/response.js';
import { MatchFunction } from 'path-to-regexp';

export type MiddlewareHandler = (
	ctx: Context,
	next: () => Response | Promise<Response>,
) => Response | Promise<Response>;

export interface MiddlewareOptions {
	priority: Priority;
	includes: Array<
		Pick<MiddlewarePathOptions, 'path'> & {
			methods: Array<string>;
			match: MatchFunction<Partial<Record<string, string | string[]>>>;
		}
	>;
	excludes: Array<
		Pick<MiddlewarePathOptions, 'path'> & {
			methods: Array<string>;
			match: MatchFunction<Partial<Record<string, string | string[]>>>;
		}
	>;
}

export interface Middleware {
	handler: MiddlewareHandler;
	config: MiddlewareOptions;
}

export type MiddlewarePathOptions = {
	path: string;
	method?: string | Array<string>;
};

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
	includes?: Array<string | MiddlewarePathOptions>;
	/**
	 * @EN `includes` to set on which routes the middleware will not be executed.
	 * @ID `includes` untuk mengatur di route mana middleware tidak akan di jalankan.
	 */
	excludes?: Array<string | MiddlewarePathOptions>;
};
