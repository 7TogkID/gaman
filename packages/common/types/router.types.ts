import { HttpMethod } from '@gaman/common/enums/http-method.enum.js';
import {
	InterceptorHandler,
	MiddlewareHandler,
	RequestHandler,
} from '@gaman/common/types/index.js';
import { ExceptionHandler } from '@gaman/core/exception/index.js';

export interface Route {
	path: string;
	methods: HttpMethod[];
	handler: RequestHandler | null;
	middlewares: MiddlewareHandler[];
	interceptors: InterceptorHandler[];
	exceptions: ExceptionHandler[];
	pattern: { regex: RegExp; keys: string[] };
	name?: string;
}

export interface RouteDefinition {
	middleware(fn: MiddlewareHandler | Array<MiddlewareHandler>): RouteDefinition;
	interceptor(
		fn: InterceptorHandler | Array<InterceptorHandler>,
	): RouteDefinition;
	exception(eh: ExceptionHandler | Array<ExceptionHandler>): RouteDefinition;
	name(s: string): RouteDefinition;
}
