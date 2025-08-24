import { RequestHandler } from '@gaman/core/types';
import {
	IS_COMPOSE_HANDLER_FACTORY,
} from '@gaman/common/contants';

export type HandlerFactory = () => Record<string, RequestHandler>;

export function composeHandler(factory: HandlerFactory): HandlerFactory {
	Object.defineProperty(factory, IS_COMPOSE_HANDLER_FACTORY, {
		value: true,
		writable: false,
		enumerable: false,
	});

	return factory;
}
