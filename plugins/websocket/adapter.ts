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

	// todo : Upgrade request ke WebSocket
	private setupUpgrade() {
		this.server.on('upgrade', (req, socket, head) => {
			this.wss.handleUpgrade(req, socket, head, async (ws) => {
				const ctx = await createContext(req);
				this.setupClient(ctx.request, socket, ws);
			});
		});
	}

	// todo : Setup tiap client baru
	private async setupClient(request: Request, socket: Stream.Duplex, ws: WS) {
		const url = new URL(request.url);
		const clientId = randomUUID();

		// todo :  Buat context WebSocket
		const ctx = this.createWebsocketContext(clientId, request, socket, ws);

		// todo : Simpan client
		this.clients.set(clientId, ctx);

		// todo : Cari route
		const route = routesData.findWebsocketRoute(url.pathname);
		if (!route) return ws.close();

		// todo : Sort middleware
		const middlewares = sortArrayByPriority(
			route.websocketMiddlewares,
			(mw) => mw.config?.priority || Priority.NORMAL,
		);

		// todo : Event binding
		const event = this.createWebsocketEvent(ws, ctx, middlewares);
		this.attachCleanup(ws, clientId);

		// todo : Panggil factory route
		route.websocket?.factory(Object.assign(ctx, event));
	}

	// todo :  Buat context untuk tiap client
	private createWebsocketContext(
		clientId: string,
		request: Request,
		socket: Stream.Duplex,
		ws: WS,
	): WebsocketContext {
		const serializeMessage = (message: any) =>
			Buffer.isBuffer(message) || typeof message === 'string'
				? message
				: JSON.stringify(message);
		
		// @ts-ignore
		return {
			...ws,
			clientId,
			request,
			socket,
			clients: Array.from(this.clients.values()),

			send: (message) => {
				if (ws.readyState === WS.OPEN) ws.send(serializeMessage(message));
			},

			close: (code?: number, message?: any) => {
				ws.close(code, message ? serializeMessage(message) : undefined);
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
	}

	// todo : Event wrapper (onMessage, onError, dll)
	private createWebsocketEvent(
		ws: WS,
		ctx: WebsocketContext,
		middlewares: WebsocketMiddleware[],
	): WebsocketEvent {
		return {
			onDisconnect: (cb) => ws.on('close', cb),
			onMessage: (cb) => {
				ws.on('message', async (data) => {
					const message = decodeMessage(data);
					const _ctx = { ...ctx, message };
					await this.runMiddlewares(_ctx, middlewares);
					cb(message);
				});
			},
			onError: (cb) => ws.on('error', cb),
			onPing: (cb) => ws.on('ping', cb),
			onPong: (cb) => ws.on('pong', cb),
		};
	}

	// todo :  Cleanup client ketika error atau close
	private attachCleanup(ws: WS, clientId: string) {
		const cleanup = () => this.clients.delete(clientId);
		ws.on('close', cleanup);
		ws.on('error', cleanup);
	}

	// todo : Middleware runner
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
