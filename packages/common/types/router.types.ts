import { HttpMethod } from '@gaman/common/enums/http-method.enum.js';
import {
	Interceptor,
	InterceptorHandler,
	Middleware,
	MiddlewareHandler,
	RequestHandler,
} from '@gaman/common/types/index.js';
import { ExceptionHandler } from '@gaman/core/exception/index.js';
import { MatchFunction } from 'path-to-regexp';
import { Websocket, WebsocketMiddleware } from './websocket.types.js';

export interface Route {
	path: string;
	methods: HttpMethod[];
	handler: RequestHandler | null;
	websocket: Websocket | null;
	websocketMiddlewares: WebsocketMiddleware[];
	middlewares: Middleware[];
	interceptors: Interceptor[];
	exceptions: ExceptionHandler[];
	match: MatchFunction<Partial<Record<string, string | string[]>>>;
	pipes: Array<MiddlewareHandler | InterceptorHandler | RequestHandler>;
	name?: string;
}

export type Routes = Array<Route>;

export interface RouteDefinition {
	middleware(
		fn:
			| Middleware
			| WebsocketMiddleware
			| Array<Middleware | WebsocketMiddleware>,
	): RouteDefinition;
	interceptor(fn: Interceptor | Array<Interceptor>): RouteDefinition;
	exception(eh: ExceptionHandler | Array<ExceptionHandler>): RouteDefinition;
	name(s: string): RouteDefinition;
}
