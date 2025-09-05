import {
	InterceptorHandler,
	Middleware,
	Route,
} from '@gaman/common/types/index.js';
import { IntegrationFactory } from '@gaman/core/integration/index.js';
import { ExceptionHandler } from './exception/index.js';

const middlewares: Middleware[] = [];
const routes: Route[] = [];
const integrations: Array<ReturnType<IntegrationFactory>> = [];
const exceptions: Array<ExceptionHandler> = [];
const interceptors: Array<InterceptorHandler> = [];

export function registerMiddlewares(...mws: Middleware[]) {
	middlewares.push(...mws);
}
export function getRegisteredMiddlewares(): Middleware[] {
	return middlewares;
}

export function registerRoutes(...rts: Route[]) {
	routes.push(...rts);
}
export function getRegisteredRoutes(): Route[] {
	return routes;
}

export function registerInterceptors(...interceptor: InterceptorHandler[]) {
	interceptors.push(...interceptor);
}
export function getRegisteredInterceptors(): InterceptorHandler[] {
	return interceptors;
}

export function registerExceptions(...interceptor: ExceptionHandler[]) {
	exceptions.push(...interceptor);
}
export function getRegisteredExceptions(): ExceptionHandler[] {
	return exceptions;
}
