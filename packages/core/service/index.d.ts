export type Fn = (...args: any[]) => any;
export type ServiceFactory<TDeps extends object = object, TReturn extends object = object> = (deps: TDeps) => TReturn;
export declare function defineService<TDeps extends object, TReturn extends Record<string, Fn>>(factory: ServiceFactory<TDeps, TReturn>): ServiceFactory<TDeps, TReturn>;
