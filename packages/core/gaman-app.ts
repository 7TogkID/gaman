import * as http from 'node:http';
import { Router } from '@gaman/core/router/handler.js';
import {
	Interceptor,
	Middleware,
	parseArgs,
	Routes,
} from '@gaman/common/index.js';
import { ExceptionHandler } from './exception/index.js';
import {
	isExceptionHandler,
	isInterceptor,
	isMiddleware,
	isRoutes,
} from '@gaman/common/validation/is.js';
import {
	registerExceptions,
	registerInterceptors,
	registerMiddlewares,
	registerRoutes,
} from './registry.js';

export class GamanApp extends Router {
	private server?: http.Server<
		typeof http.IncomingMessage,
		typeof http.ServerResponse
	>;

	mount(...v: Array<Interceptor | Middleware | ExceptionHandler | Routes>) {
		for (const value of v) {
			if (isInterceptor(value)) {
				registerInterceptors(value);
			} else if (isMiddleware(value)) {
				registerMiddlewares(value);
			} else if (isExceptionHandler(value)) {
				registerExceptions(value);
			} else if (isRoutes(value)) {
				registerRoutes(value);
			}
		}
	}

	async mountServer(
		address?: string,
	): Promise<
		http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
	> {
		const { args } = parseArgs();

		const DEFAULT_HOST =
			args['host'] === true
				? '0.0.0.0'
				: args['host'] || process.env.HOST || '127.0.0.1';

		const DEFAULT_PORT =
			args['port'] ||
			(process.env.PORT ? parseInt(process.env.PORT, 10) : 3431);

		let host = DEFAULT_HOST;
		let port = DEFAULT_PORT;

		if (address) {
			const [h, p] = address.split(':');

			if (h) host = h;
			if (p) port = parseInt(p, 10);
		}

		return new Promise<
			http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
		>((resolve, reject) => {
			try {
				const server = http.createServer(this.requestHandle.bind(this));

				this.server = server;
				this.server.listen(port, host == true ? '0.0.0.0' : `${host}`, () => {
					resolve(server);
				});
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
