import { RequestHandler } from '@gaman/core/types';

export type HandlerFactory = () => Record<string, RequestHandler>;

export function composeHandler(factory: HandlerFactory): HandlerFactory {
	return factory;
}
