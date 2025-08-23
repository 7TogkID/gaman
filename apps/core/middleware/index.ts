import { IS_MIDDLEWARE_SYMBOL } from '@gaman/common/contants';
import type { RequestHandler } from '../types';

export function defineMiddleware(handler: RequestHandler): RequestHandler {
	// @ts-ignore
	handler[IS_MIDDLEWARE_SYMBOL] = true;
	return handler;
}
