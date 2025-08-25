import { HttpMethod } from '@gaman/common/enums/http-method.enum';
import {
	InterceptorHandler,
	MiddlewareHandler,
	RequestHandler,
} from '@gaman/common/types';

export interface Route {
	path: string;
	methods: HttpMethod[];
	handler: RequestHandler | null;
	middlewares: MiddlewareHandler[];
	interceptors: InterceptorHandler[];
	pattern: { regex: RegExp; keys: string[] };
	name?: string;
}

export interface RouteDefinition {
	middleware(fn: MiddlewareHandler | Array<MiddlewareHandler>): RouteDefinition;
	interceptor(
		fn: InterceptorHandler | Array<InterceptorHandler>,
	): RouteDefinition;
	name(s: string): RouteDefinition;
}
