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
import interceptorData from '@gaman/common/data/interceptor-data.js';
import middlewareData from '@gaman/common/data/middleware-data.js';
import exceptionData from '@gaman/common/data/exception-data.js';
import routesData from '@gaman/common/data/routes-data.js';

export class GamanApp extends Router {
	private server?: http.Server<
		typeof http.IncomingMessage,
		typeof http.ServerResponse
	>;

	mount(...v: Array<Interceptor | Middleware | ExceptionHandler | Routes>) {
		for (const value of v) {
			if (isInterceptor(value)) {
				interceptorData.register(value);
			} else if (isMiddleware(value)) {
				middlewareData.register(value);
			} else if (isExceptionHandler(value)) {
				exceptionData.register(value);
			} else if (isRoutes(value)) {
				routesData.register(value);
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
			args.host === true
				? '0.0.0.0'
				: args.host || process.env.HOST || '127.0.0.1';

		const DEFAULT_PORT =
			args.port || (process.env.PORT ? parseInt(process.env.PORT, 10) : 3431);

		let host = DEFAULT_HOST;
		let port = DEFAULT_PORT;

		if (address) {
			const [h, p] = address.split(':');
			if (h) host = h;
			if (p) port = parseInt(p, 10);
		}

		return new Promise((resolve, reject) => {
			try {
				const server = http.createServer(this.requestHandle.bind(this));
				this.server = server;

				const noServer = process.argv.includes('--no-server');
				if (noServer || process.env.NO_SERVER === 'true') {
					// ! kalau dia pakai flag --no-server maka server tidak akan pernah di listen
					return resolve(server);
				}

				this.server.listen(port, host == true ? '0.0.0.0' : `${host}`, () => {
					resolve(server);
				});0

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
