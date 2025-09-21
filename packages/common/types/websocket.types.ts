import http from 'node:http';
import WebSocket from 'ws';
import { Request } from './types.js';
import Stream from 'node:stream';
import { DefaultMiddlewareOptions } from '@gaman/common/types/middleware.types.js';

export type Websocket = {
	factory: WebsocketHandler;
};

export type WebsocketContext = {
	clientId: string;
	request: Request;
	socket: Stream.Duplex;
	clients: Array<WebsocketContext>;
	close(code?: number, message?: any): any;
	broadcast(message: any, withoutMe?: boolean): any;
	send(message: any): any;
} & Omit<WebSocket, 'send' | 'close'>;

export type WebsocketHandler = (
	handler: WebsocketContext & WebsocketEvent,
) => any;

export interface WebsocketEvent {
	onDisconnect: (
		callback: (code?: number, reason?: string) => any | Promise<any>,
	) => any;

	onMessage: (callback: (message: any) => any | Promise<any>) => any;
	onError: (callback: (error: Error) => any | Promise<any>) => any;
	onPing: (callback: (message: any) => any | Promise<any>) => any;
	onPong: (callback: (message: any) => any | Promise<any>) => any;
}

export interface WebsocketAdapter {
	listen: (
		server: http.Server<
			typeof http.IncomingMessage,
			typeof http.ServerResponse
		>,
		route: string,
		factory: WebsocketHandler,
	) => void;
}

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */
export type WebsocketMiddleware = {
	handler: WebsocketMiddlewareHandler;
	config?: Pick<DefaultMiddlewareOptions, 'priority'>;
};

export type WebsocketMiddlewareHandler = (
	ctx: WebsocketContext & { message: any },
	next: () => any | Promise<any>,
) => any | Promise<any>;
