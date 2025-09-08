import {
	Interceptor,
	Middleware,
	Route,
	Routes,
} from '@gaman/common/types/index.js';
import { IntegrationFactory } from '@gaman/core/integration/index.js';
import { ExceptionHandler } from './exception/index.js';

const middlewares: Middleware[] = [];
const routes: Route[] = [];
const integrations: Array<ReturnType<IntegrationFactory>> = [];
const exceptions: Array<ExceptionHandler> = [];
const interceptors: Array<Interceptor> = [];

export function registerMiddlewares(...mws: Middleware[]) {
	middlewares.push(...mws);
}
export function getRegisteredMiddlewares(): Middleware[] {
	return middlewares;
}

export function registerRoutes(rts: Routes) {
	routes.push(...rts);
}
export function getRegisteredRoutes(): Routes {
	return routes;
}

export function registerInterceptors(...interceptor: Interceptor[]) {
	interceptors.push(...interceptor);
}
export function getRegisteredInterceptors(): Interceptor[] {
	return interceptors;
}

export function registerExceptions(...interceptor: ExceptionHandler[]) {
	exceptions.push(...interceptor);
}
export function getRegisteredExceptions(): ExceptionHandler[] {
	return exceptions;
}
