import { MiddlewareHandler, Route } from '@gaman/common/types/index.js';
import * as http from 'node:http';
import { registerMiddlewares, registerRoutes } from '@gaman/core/registry.js';
import { requestHandle } from '@gaman/core/router/handler.js';
import { getArg } from '@gaman/common/index.js';

export class GamanApp {
	private server?: http.Server<
		typeof http.IncomingMessage,
		typeof http.ServerResponse
	>;

	async mountRoutes(rt: Route[]) {
		registerRoutes(...rt); 
	}

	async mountMiddleware(mw: MiddlewareHandler | Array<MiddlewareHandler>) {
		if (Array.isArray(mw)) {
			registerMiddlewares(...mw);
		} else {
			registerMiddlewares(mw);
		}
	}

	async mountServer(address?: string) {
		const DEFAULT_HOST = getArg('--host', '-h', {
			default: process.env.HOST || '127.0.0.1',
		});
		const DEFAULT_PORT = getArg('--port', '-p', {
			parseNumber: true,
			default: process.env.PORT ? parseInt(process.env.PORT, 10) : 3431,
		}) as number;

		let host = DEFAULT_HOST;
		let port = DEFAULT_PORT;

		if (address) {
			const [h, p] = address.split(':');

			if (h) host = h;
			if (p) port = parseInt(p, 10);
		}

		return new Promise<void>((resolve, reject) => {
			try {
				this.server = http.createServer(requestHandle);
				this.server.listen(port, host == true ? '0.0.0.0' : `${host}`, resolve);
				this.server.on('error', reject);
			} catch (err) {
				reject(err);
			}
		});
	}

	async close() {
		return new Promise<void>((resolve, reject) => {
			if (!this.server) {
				return reject(new Error('Server is not running'));
			}
			this.server.close((err) => {
				if (err) return reject(err);
				resolve();
			});
		});
	}
}
