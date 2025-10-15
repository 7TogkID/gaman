import { Fn, ServiceFactory } from '@gaman/common';

export function composeService<
	TDeps extends object,
	TReturn extends Record<string, Fn>,
>(factory: ServiceFactory<TDeps, TReturn>): ServiceFactory<TDeps, TReturn> {
	return factory;
}
