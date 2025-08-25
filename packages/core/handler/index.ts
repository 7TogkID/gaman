import {
	IS_COMPOSE_HANDLER_FACTORY,
} from '@gaman/common/contants';
import { RequestHandler } from '@gaman/common/types';

export type HandlerFactory<T extends Record<string, RequestHandler>> = () => T;

export function composeHandler<T extends Record<string, RequestHandler>>(
  factory: HandlerFactory<T>
): HandlerFactory<T> {
  Object.defineProperty(factory, IS_COMPOSE_HANDLER_FACTORY, {
    value: true,
    writable: false,
    enumerable: false,
  });

  return factory;
}
