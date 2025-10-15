export type Fn = (...args: any[]) => any;
export type ServiceFactory<TDeps extends object = object, TReturn extends object = object> = (
  deps?: TDeps
) => TReturn;
