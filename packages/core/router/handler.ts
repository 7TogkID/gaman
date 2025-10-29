import * as http from 'node:http';
import { createContext } from '@gaman/core/context/index.js';
import {
	Context,
	Interceptor,
	InterceptorHandler,
	Middleware,
	MiddlewareHandler,
	MiddlewareOptions,
	RequestHandler,
	Route,
	Routes,
} from '@gaman/common/types/index.js';
import { IGNORED_LOG_FOR_PATH_REGEX } from '@gaman/common/contants.js';
import { Response } from '@gaman/core/response.js';

import { Readable } from 'node:stream';
import { GamanCookies } from '@gaman/core/context/cookies/index.js';
import { ExceptionHandler } from '../exception/index.js';
import { HttpException, InterceptorException } from '@gaman/common/index.js';
import middlewareData from '@gaman/common/data/middleware-data.js';
import routesData from '@gaman/common/data/routes-data.js';
import exceptionData from '@gaman/common/data/exception-data.js';
import interceptorData from '@gaman/common/data/interceptor-data.js';
import { shouldRunMiddleware } from '@gaman/common/utils/should-middleware.js';

export class Router {
	/**
	 * @deprecated
	 */
	async mountRoutes(rt: Routes) {
		Log.warn(
			`'app.mountRoutes()' is deprecated, please use the new function 'app.mount()'`,
		);
		routesData.register(rt);
	}

	/**
	 * @deprecated
	 */
	async mountMiddleware(mw: Middleware | Array<Middleware>) {
		Log.warn(
			`'app.mountMiddleware()' is deprecated, please use the new function 'app.mount()'`,
		);
		if (Array.isArray(mw)) {
			middlewareData.register(...mw);
		} else {
			middlewareData.register(mw);
		}
	}

	/**
	 * @deprecated
	 */
	async mountExceptionHandler(eh: ExceptionHandler | Array<ExceptionHandler>) {
		Log.warn(
			`'app.mountExceptionHandler()' is deprecated, please use the new function 'app.mount()'`,
		);
		if (Array.isArray(eh)) {
			exceptionData.register(...eh);
		} else {
			exceptionData.register(eh);
		}
	}

	/**
	 * @deprecated
	 */
	async mountInterceptor(ih: Interceptor | Array<Interceptor>) {
		Log.warn(
			`'app.mountInterceptor()' is deprecated, please use the new function 'app.mount()'`,
		);
		if (Array.isArray(ih)) {
			interceptorData.register(...ih);
		} else {
			interceptorData.register(ih);
		}
	}

	protected async requestHandle(
		req: http.IncomingMessage,
		res: http.ServerResponse,
	) {
		const startTime = performance.now();
		const method = req.method?.toUpperCase() || 'GET';
		const urlString = req.url || '/';
		const url = new URL(urlString, `http://${req.headers.host}`);
		const ctx = await createContext(req, res);

		// ? Build Pipeline: monitor middlewares
		const pipeline: Array<
			MiddlewareHandler | InterceptorHandler | RequestHandler
		> = middlewareData
			.getMonitorMiddlewares()
			.filter((mw) => shouldRunMiddleware(mw, ctx.request.pathname, method))
			.map((mw) => mw.handler);

		Log.setRoute(ctx.request.pathname || '/');
		Log.setMethod(method);

		let route: Route | undefined;
		try {
			let index = -1;
			let done_find_route = false;
			const next = async (i: number): Promise<Response> => {
				if (i <= index) {
					throw new Error('next() called multiple times');
				}
				index = i;

				let fn = pipeline[i];

				/**
				 * ? jika next nya kosong dan `done_find_route` juga false maka saatnya nyari route
				 * ? Karna sebelumnya kan jalanin `MONITOR_MIDDLEWARES`
				 */
				if (!fn && !done_find_route) {
					done_find_route = true;
					// ? mencari route yang cocok
					const { route: r, params } = routesData.findRoute(
						url.pathname,
						method,
					);
					if (!r?.handler) {
						return new Response(undefined, { status: 404 });
					}

					route = r; // ! set route
					ctx.request.params = params; // ! set params

					// **** MIDDLEWARE ****
					// ? filter global middlewares dari options kek includes: [] dan excludes: []
					const activeMiddlewares = middlewareData
						.getMiddlewares()
						.filter((mw) =>
							shouldRunMiddleware(mw, ctx.request.pathname, method),
						)
						.map((m) => m.handler);

					pipeline.push(
						...activeMiddlewares, // ? middleware harus paling awal
						...interceptorData.getInterceptors().map((i) => i.handler),
						...r.pipes,
					);

					fn = pipeline[i]; // ! set ulang
				}

				if (!fn) return new Response(undefined, { status: 404 });
				return await fn(ctx, () => next(i + 1));
			};

			const result = await next(0);
			await this.handleResponse(result as Response, res, ctx);
		} catch (error: any) {
			// ? init context on http exception
			if (error instanceof HttpException) {
				Object.defineProperty(error, 'context', {
					value: ctx,
					writable: true,
					configurable: true,
					enumerable: true,
				});
			}

			for (const runExceptionHandler of [
				...exceptionData.getExceptionHandlers(),
				...(route?.exceptions || []),
			]) {
				// ? run exception handler
				const response = await runExceptionHandler(error);

				if (response instanceof Response) {
					// ? if exception handler have a response like: Res.json or else
					// ? so handleResponse
					return await this.handleResponse(response, res, ctx);
				}
			}

			/**
			 * ? Jika error adalah dari interceptor
			 * ? maka akan di kasih default response seperti berikut
			 * ? bisa di rewrite tinggal buat `composeExceptionHandler` aja
			 */
			if (error instanceof InterceptorException) {
				return await this.handleResponse(
					Res.json(
						{
							statusCode: error.statusCode,
							message: error.message,
						},
						error.statusCode,
					),
					res,
					ctx,
				);
			}

			Log.error(error.message);
			console.error(error.details);
			return await this.handleResponse(
				new Response(undefined, { status: 500 }),
				res,
				ctx,
			);
		} finally {
			const endTime = performance.now();
			if (
				Log.response.route &&
				Log.response.status &&
				Log.response.method &&
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

	/**
	 * @ID
	 * Menangani class Response sebelum dikirim ke client
	 * GamanJS akan memakai class Response sendiri untuk membuat response itu menjadi sederhada, seperti: Res.json Res.text dll
	 * 
	 * @param response 
	 * @param res 
	 * @param ctx 
	 * @returns 
	 */
	protected async handleResponse(
		response: Response | undefined,
		res: http.ServerResponse,
		ctx?: Context,
	) {
		if (res.writableEnded) return;

		if (!response) {
			response = new Response(undefined, { status: 404 });
		}

		// if (integrations) {
		// 	const integrations = sortArrayByPriority<ReturnType<IntegrationFactory>>(
		// 		integrations,
		// 		'priority',
		// 		'asc',
		// 	);

		// 	for (const integration of integrations) {
		// 		if (integration.onResponse) {
		// 			const integrationResponse = await integration.onResponse(
		// 				ctx,
		// 				response,
		// 			);
		// 			if (integrationResponse) {
		// 				response = integrationResponse;
		// 				break;
		// 			}
		// 		}
		// 	}
		// }

		if (ctx) {
			for (const [key, value] of ctx.headers.entries()) {
				if (value[1] == true) {
					response.headers.set(key, value[0]);
				}
			}

			const cookieHeaders = Array.from(GamanCookies.consume(ctx.cookies));
			if (cookieHeaders.length > 0) {
				response.headers.set('Set-Cookie', cookieHeaders);
			}
		}

		response.headers.set('X-Powered-By', 'Gaman');

		res.statusCode = response.status;
		res.statusMessage = response.statusText;
		res.setHeaders(response.headers.toMap());
		Log.setStatus(response.status);

		if (response.body instanceof Readable) {
			return response.body.pipe(res);
		}
		return res.end(response.body);
	}
}
