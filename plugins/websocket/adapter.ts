import {
	WebsocketContext,
	WebsocketEvent,
	WebsocketMiddleware,
} from '@gaman/common/types/websocket.types.js';
import { randomUUID } from 'node:crypto';
import http from 'node:http';
import WS, { WebSocketServer } from 'ws';
import { createContext } from '@gaman/core/context/index.js';
import { Priority, Request, sortArrayByPriority } from '@gaman/common/index.js';
import routesData from '@gaman/common/data/routes-data.js';
import Stream from 'node:stream';
import { decodeMessage } from './helper.js';

export class WebsocketAdapter {
	private wss: WebSocketServer;
	private clients: Map<string, WebsocketContext> = new Map();

	constructor(
		private server: http.Server<
			typeof http.IncomingMessage,
			typeof http.ServerResponse
		>,
		options?: Omit<
			WS.ServerOptions<typeof WS, typeof http.IncomingMessage>,
			'server' | 'path' | 'noServer' | 'port' | 'host'
		>,
	) {
		this.wss = new WebSocketServer({ ...options, noServer: true });
		this.setupUpgrade();
	}

	private setupUpgrade() {
		this.server.on('upgrade', (req, socket, head) => {
			this.wss.handleUpgrade(req, socket, head, async (ws) => {
				const ctx = await createContext(req);
				this.setupClient(ctx.request, socket, ws);
			});
		});
	}

	private async setupClient(request: Request, socket: Stream.Duplex, ws: WS) {
		const url = new URL(request.url);
		const clientId = randomUUID();

		const { send, close, ...otherWs } = ws;

		const ctx: WebsocketContext = {
			...otherWs,
			ping: ws.ping,
			pong: ws.pong,
			terminate: ws.terminate,
			pause: ws.pause,
			resume: ws.resume,
			addEventListener: ws.addEventListener,
			removeEventListener: ws.removeEventListener,
			on: ws.on,
			once: ws.once,
			off: ws.off,
			addListener: ws.addListener,
			removeListener: ws.removeListener,
			clientId,
			request,
			socket,
			clients: Array.from(this.clients.values()),

			send: (message) => {
				if (ws.readyState === WS.OPEN) {
					if (Buffer.isBuffer(message)) {
						ws.send(message);
					} else if (typeof message === 'string') {
						ws.send(message);
					} else {
						ws.send(JSON.stringify(message));
					}
				}
			},

			close(code, message) {
				if (Buffer.isBuffer(message)) {
					ws.close(code, message);
				} else if (typeof message === 'string') {
					ws.close(code, message);
				} else {
					ws.close(code, JSON.stringify(message));
				}
			},

			broadcast: (message, withoutMe = false) => {
				this.clients.forEach((c) => {
					if (
						c.readyState === WS.OPEN &&
						(!withoutMe || c.clientId !== clientId)
					) {
						c.send(message);
					}
				});
			},
		};

		this.clients.set(clientId, ctx);
		const route = routesData.findWebsocketRoute(url.pathname);
		if (!route) {
			ws.close();
			return;
		}

		const middlewares = sortArrayByPriority(
			route.websocketMiddlewares,
			(mw) => mw.config?.priority || Priority.NORMAL,
		);
		const runMiddlewares = this.runMiddlewares;

		const event: WebsocketEvent = {
			onDisconnect(callback) {
				ws.on('close', callback);
			},
			onMessage(callback) {
				ws.on('message', async (data) => {
					const message = decodeMessage(data);
					const _ctx = { ...ctx, message };
					await runMiddlewares(_ctx, middlewares);
					callback(message);
				});
			},
			onError(callback) {
				ws.on('error', callback);
			},
			onPing(callback) {
				ws.on('ping', callback);
			},
			onPong(callback) {
				ws.on('pong', callback);
			},
		};

		ws.on('close', () => this.clients.delete(clientId));
		ws.on('error', () => this.clients.delete(clientId));
		route.websocket?.factory(Object.assign(ctx, event));
	}

	private async runMiddlewares(
		ctx: WebsocketContext & { message: any },
		middlewares: WebsocketMiddleware[],
	) {
		let index = -1;
		const next = async () => {
			index++;
			const mw = middlewares[index];
			if (!mw) return;
			await mw.handler(ctx, next);
		};
		await next();
	}
}
