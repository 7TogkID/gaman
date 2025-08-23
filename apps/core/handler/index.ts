import { RequestHandler } from '../types';

export type HandlerFactory = () => Record<string, RequestHandler >;

export function composeHandler(factory: HandlerFactory): HandlerFactory {
	return factory;
}
