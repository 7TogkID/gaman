import { IS_WEBSOCKET_MIDDLEWARE } from '@gaman/common/contants.js';
import { DefaultMiddlewareOptions } from '@gaman/common/index.js';
import {
	WebsocketMiddleware,
	WebsocketMiddlewareHandler,
} from '@gaman/common/types/websocket.types.js';

export function composeWebsocketMiddleware(
	handler: WebsocketMiddlewareHandler,
	cfg?: Pick<DefaultMiddlewareOptions, 'priority'>,
): (
	config?: Pick<DefaultMiddlewareOptions, 'priority'>,
) => WebsocketMiddleware {
	return (config = cfg) => {
		const mw = { handler, config };
		Object.defineProperty(mw, IS_WEBSOCKET_MIDDLEWARE, {
			value: true,
			configurable: false,
			writable: false,
		});
		return mw;
	};
}
