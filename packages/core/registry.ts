import { MiddlewareHandler, Route } from '@gaman/common/types';
import { IntegrationFactory } from '@gaman/core/integration';

const middlewares: MiddlewareHandler[] = [];
const routes: Route[] = [];
const integrations: Array<ReturnType<IntegrationFactory>> = [];

export function registerMiddlewares(...mws: MiddlewareHandler[]) {
	middlewares.push(...mws);
}
export function getRegisteredMiddlewares(): MiddlewareHandler[] {
	return middlewares;
}

export function registerRoutes(...rts: Route[]) {
	routes.push(...rts);
}
export function getRegisteredRoutes(): Route[] {
	return routes;
}
