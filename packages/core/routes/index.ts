import { IS_ROUTES_FACTORY_SYMBOL } from '../symbol';
import { AppConfig, Handler } from '../types';

export interface Router<A extends AppConfig> {
	GET?: Handler<A> | Handler<A>[];
	HEAD?: Handler<A> | Handler<A>[];
	PUT?: Handler<A> | Handler<A>[];
	PATCH?: Handler<A> | Handler<A>[];
	POST?: Handler<A> | Handler<A>[];
	DELETE?: Handler<A> | Handler<A>[];
	OPTIONS?: Handler<A> | Handler<A>[];

	[nestedPath: string]: Router<A> | Handler<A> | Handler<A>[] | undefined;
}

export interface RoutesDefinition<A extends AppConfig> {
	[path: string]: Router<A> | Handler<A> | Handler<A>[];
}

export type RoutesFactory<TDeps extends object, A extends AppConfig> = (
	deps: TDeps,
) => RoutesDefinition<A>;

/**
 * Defines a routes structure that can be either a RoutesDefinition,
 * a Router object, a single Handler, or an array of Handlers.
 *
 * This utility helps with type inference and validation when defining nested
 * routes or modular routing blocks in a GamanJS application.
 *
 * @template T - The accepted route definition type (RoutesDefinition, Router, Handler, or Handler[]).
 * @template A - The application config type extending AppConfig.
 * @param obj - The routing configuration to define.
 * @returns The same routing structure with proper typing.
 */
export function defineRoutes<TDeps extends object, A extends AppConfig>(
	factory: RoutesFactory<TDeps, A>,
): RoutesFactory<TDeps, A> {
	factory[IS_ROUTES_FACTORY_SYMBOL] = true;
	return factory;
}
