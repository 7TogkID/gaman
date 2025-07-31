import { IS_MIDDLEWARE_SYMBOL } from '../symbol';
import type { AppConfig, Handler } from '../types';

export function defineMiddleware<A extends AppConfig>(
	handler: Handler<A>,
): Handler<A> {
	handler[IS_MIDDLEWARE_SYMBOL] = true;
	return handler;
}
