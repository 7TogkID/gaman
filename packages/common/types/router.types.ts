import { HttpMethod } from '@gaman/common/enums/http-method.enum.js';
import {
	InterceptorHandler,
	Middleware,
	RequestHandler,
} from '@gaman/common/types/index.js';
import { ExceptionHandler } from '@gaman/core/exception/index.js';
import { MatchFunction } from 'path-to-regexp';

export interface Route {
	path: string;
	methods: HttpMethod[];
	handler: RequestHandler | null;
	middlewares: Middleware[];
	interceptors: InterceptorHandler[];
	exceptions: ExceptionHandler[];
	match: MatchFunction<Partial<Record<string, string | string[]>>>,
	name?: string;
}

export interface RouteDefinition {
	middleware(fn: Middleware | Array<Middleware>): RouteDefinition;
	interceptor(
		fn: InterceptorHandler | Array<InterceptorHandler>,
	): RouteDefinition;
	exception(eh: ExceptionHandler | Array<ExceptionHandler>): RouteDefinition;
	name(s: string): RouteDefinition;
}
