import { IS_WEBSOCKET } from '@gaman/common/contants.js';
import {
	Websocket,
	WebsocketHandler,
} from '@gaman/common/types/websocket.types.js';
import http from 'http';
import { WebsocketAdapter } from './adapter.js';
import WS from 'ws';
export { composeWebsocketMiddleware } from './middleware.js';

export class WebsocketGateway {
	public static upgrade(
		server: http.Server<
			typeof http.IncomingMessage,
			typeof http.ServerResponse
		>,
		options?: Omit<
			WS.ServerOptions<typeof WS, typeof http.IncomingMessage>,
			'server' | 'path' | 'noServer' | 'port' | 'host'
		>,
	) {
		new WebsocketAdapter(server, options);
	}x
}


export function composeWebsocket(factory: WebsocketHandler): Websocket {
	const ws: Websocket = { factory };
	Object.defineProperty(ws, IS_WEBSOCKET, {
		value: true,
		writable: false,
		configurable: false,
	});

	return ws;
}
