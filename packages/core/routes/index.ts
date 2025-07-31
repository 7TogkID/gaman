import { IS_ROUTES_FACTORY_SYMBOL } from '../symbol';
import { AppConfig, RoutesDefinition } from '../types';

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
