import { IS_SERVICE_FACTORY } from "@gaman/common/contants";

export type Fn = (...args: any[]) => any;
export type ServiceFactory<
	TDeps extends object = object,
	TReturn extends object = object,
> = (deps: TDeps) => TReturn;

export function defineService<
	TDeps extends object,
	TReturn extends Record<string, Fn>,
>(factory: ServiceFactory<TDeps, TReturn>): ServiceFactory<TDeps, TReturn> {
	// @ts-ignore
	factory[IS_SERVICE_FACTORY] = true;
	return factory;
}
