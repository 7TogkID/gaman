export type ServiceFn = (...args: any[]) => any;
export type ServiceFactory<
	TReturn extends object,
	Args extends any[] = any[],
> = (...args: Args) => TReturn;
