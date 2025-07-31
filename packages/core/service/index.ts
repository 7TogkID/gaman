import { IS_SERVICE_FACTORY_SYMBOL } from '../symbol';

export type Fn = (...args: any[]) => any;
export type ServiceFactory<
	TDeps extends object = object,
	TReturn extends object = object,
> = (deps: TDeps) => TReturn;

export function defineService<
	TDeps extends object,
	TReturn extends Record<string, Fn>,
>(factory: ServiceFactory<TDeps, TReturn>): ServiceFactory<TDeps, TReturn> {
	factory[IS_SERVICE_FACTORY_SYMBOL] = true;
	return factory;
}
