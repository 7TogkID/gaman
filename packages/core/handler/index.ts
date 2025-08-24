import { RequestHandler } from '@gaman/core/types';
import {
	IS_COMPOSE_HANDLER_FACTORY,
	IS_REQUEST_HANDLER,
} from '@gaman/common/contants';

export type HandlerFactory = () => Record<string, RequestHandler>;

export function composeHandler(factory: HandlerFactory): HandlerFactory {
	const newFactory = () => {
		const handlers = factory();

		// ? taruh identity bahwa dia itu handler ke semua method
		for (const value of Object.values(handlers)) {
			if (typeof value === 'function') {
				Object.defineProperty(value, IS_REQUEST_HANDLER, {
					value: true,
					writable: false,
					enumerable: false,
				});
			}
		}

		return handlers;
	};
	Object.defineProperty(newFactory, IS_COMPOSE_HANDLER_FACTORY, {
		value: true,
		writable: false,
		enumerable: false,
	});

	return newFactory;
}
