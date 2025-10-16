import { ServiceFn, ServiceFactory } from '@gaman/common';

export function composeService<
	TReturn extends Record<string, ServiceFn>,
	Args extends any[] = any[],
>(factory: ServiceFactory<TReturn, Args>): ServiceFactory<TReturn, Args> {
	return factory;
}
