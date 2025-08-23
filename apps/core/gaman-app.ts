import type { Context } from './types';
import * as http from 'node:http';
import { Log } from '@gaman/common/utils/logger';
import { createContext } from './context';
import { isHtmlString } from '@gaman/common/utils/utils';
import { Response } from './response';
import { sortArrayByPriority } from '@gaman/common/utils/priority';
import { performance } from 'perf_hooks';
import { Readable } from 'node:stream';
import { GamanCookies } from './context/cookies';
import { next } from './next';
import { IntegrationFactory } from './integration';
import { loadEnv } from '@gaman/common/utils/load-env';
import { Route } from './routes';
import { HTTP_RESPONSE_SYMBOL, IGNORED_LOG_FOR_PATH_REGEX } from '@gaman/common/contants';

export class GamanApp {
	routes: Route[] = [];
	integrations: Array<ReturnType<IntegrationFactory>> = [];
	server: http.Server<
		typeof http.IncomingMessage,
		typeof http.ServerResponse
	> | null = null;
	strict = false;
	silent = false;

	/**
	 * must use slash '/' at the end of the path
	 * @example '/user/detail/'
	 * @default true
	 */
	setStrict(v: boolean = true) {
		this.strict = v;
	}

	setSilent(v: boolean = true) {
		this.silent = v;
	}

	/**
	 * Register one or more integrations into the application lifecycle.
	 * Each integration will be instantiated using its factory and stored internally.
	 * Executes `onLoad()` if the integration provides it.
	 *
	 * @param integrationFactories - A list of factory functions that return Integration objects.
	 */
	mountIntegration(...integrationFactories: IntegrationFactory[]) {
		for (const factory of integrationFactories) {
			const integration = factory(this);
			this.integrations.push(integration);
			integration.onLoad?.();
		}
	}

	mountRoutes(route: Route[]) {
		this.routes.push(...route);
	}

	/**
	 * load and parse env data to `process.env`
	 */
	loadEnv(envPath = '.env') {
		loadEnv(envPath);
	}

	private async requestHandle(
		req: http.IncomingMessage,
		res: http.ServerResponse,
	) {
		const startTime = performance.now();
		const ctx = await createContext(this, req, res);
		Log.setRoute(ctx.request.pathname || '/');
		Log.setMethod(ctx.request.method.toUpperCase());
		try {
			for (const route of this.routes) {
				/**
				 * ? Jika methods kosong = ALL METHOD bisa akses
				 * ? atau jika methods ada brrti kusus method tertentu yang di set
				 */
				const methods = route.methods;
				if (
					!methods.length ||
					methods.includes(ctx.request.method.toUpperCase())
				) {
					const match = route.pattern?.regex.exec(ctx.request.pathname);
					route.pattern?.keys.forEach((key, index) => {
						ctx.params[key] = match?.[index + 1] || '';
					});

					if (match) {
						const dataSet: Record<string, any> = {};

						const ctxCloning = { ...ctx };
						ctxCloning.set = (k, v) => {
							dataSet[k] = v;
						};
						ctxCloning.get = <T = any>(k: string): T => {
							return dataSet[k] as T;
						};
						ctxCloning.has = (k) => {
							return k in dataSet;
						};

						const result = await route.handler?.(ctxCloning, next);
						if (result) {
							return await this.handleResponse(result, ctxCloning);
						}
					}
				}
			}

			// not found
			return await this.handleResponse(
				new Response(undefined, { status: 404 }),
				ctx,
			);
		} catch (error: any) {
			Log.error(error.message);
			console.error(error.details);
			return await this.handleResponse(
				new Response(undefined, { status: 500 }),
				ctx,
			);
		} finally {
			const endTime = performance.now();

			/**
			 * * kalau route dan status = null di tengah jalan
			 * * berarti gausah di kasih log
			 */
			if (
				Log.response.route &&
				Log.response.status &&
				Log.response.method &&
				!this.silent &&
				!IGNORED_LOG_FOR_PATH_REGEX.test(Log.response.route)
			) {
				Log.log(
					`Request processed in §a(${(endTime - startTime).toFixed(1)}ms)§r`,
				);
			}
			Log.setRoute('');
			Log.setMethod('');
			Log.setStatus(null);
		}
	}

	private async handleResponse(
		result: string | object | any[] | Response | undefined,
		ctx: Context,
	) {
		//@ts-ignore
		const res: http.ServerResponse = ctx[HTTP_RESPONSE_SYMBOL];
		if (res.writableEnded) return; // * ignore process if response finished

		const isResponse = (value: unknown): value is Response => {
			return value instanceof Response;
		};

		/**
		 * * substitue result
		 * @default response 404
		 */
		let response: Response = new Response(undefined, { status: 404 });

		if (isResponse(result)) {
			response = result;
		} else {
			/**
			 * * intialize response without class Response
			 * @example return {message: "OK"}; or return "OK!";
			 */
			if (typeof result === 'string') {
				if (isHtmlString(result)) {
					response = Response.html(result, {
						status: 200,
					});
				} else {
					response = Response.text(result, {
						status: 200,
					});
				}
			} else if (result) {
				response = Response.json(result, {
					status: 200,
				});
			}
		}

		/**
		 * * proccess integrations first
		 */
		if (this.integrations) {
			const integrations = sortArrayByPriority<ReturnType<IntegrationFactory>>(
				this.integrations,
				'priority',
				'asc',
			);

			for (const integration of integrations) {
				if (integration.onResponse) {
					const integrationResponse = await integration.onResponse(
						ctx,
						response,
					);
					if (integrationResponse) {
						response = integrationResponse;
						break;
					}
				}
			}
		}

		/**
		 * set headers setter
		 */
		for (const [key, value] of ctx.headers.entries()) {
			// if setter == true
			if (value[1] == true) {
				response.headers.set(key, value[0]);
			}
		}

		/**
		 * set cookies
		 */
		const cookieHeaders = Array.from(GamanCookies.consume(ctx.cookies));
		if (cookieHeaders.length > 0) {
			response.headers.set('Set-Cookie', cookieHeaders);
		}

		// * initialize http response
		res.statusCode = response.status;
		res.statusMessage = response.statusText;
		res.setHeaders(response.headers.toMap());
		Log.setStatus(response.status);

		if (response.body instanceof Readable) {
			return response.body.pipe(res);
		}
		return res.end(response.body);
	}

	async listen(port?: number, host?: string): Promise<void> {
		this.server = http.createServer(this.requestHandle.bind(this));

		// this.server.on('upgrade', (request, socket, head) => {
		// 	const urlString = request.url || '/';
		// 	const { pathname } = new URL(urlString, `http://${request.headers.host}`);

		// 	const wss = this.websocket.getWebSocketServer(pathname);
		// 	if (wss) {
		// 		wss.handleUpgrade(request, socket, head, function done(ws) {
		// 			wss.emit('connection', ws, request);
		// 		});
		// 	} else {
		// 		socket.destroy();
		// 	}
		// });

		this.server.listen(
			process.env.PORT || port || 3431,
			process.env.HOST || host || '127.0.0.1',
			async () => {
				for await (const intr of this.integrations) {
					await intr.onListen?.(this.server);
				}
			},
		);
	}

	close(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.server) {
				this.server.close((err) => {
					if (err) reject(err);
					else resolve();
				});
			} else {
				resolve();
			}
		});
	}

	private checkMiddleware(
		pathMiddleware: string,
		pathRequestClient: string,
	): boolean {
		// Escape special regex characters except '*'
		const escapedPath = pathMiddleware.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');

		// Replace '*' with regex wildcard
		const pattern = `^${escapedPath.replace(/\*/g, '.*')}$`;

		// Create a regex from the pattern
		const regex = new RegExp(pattern);

		// Test the client request path against the regex
		return regex.test(pathRequestClient);
	}
}
