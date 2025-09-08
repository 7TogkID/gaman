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
import { sortArrayByPriority } from '@gaman/common/utils/index.js';
import {
	getRegisteredExceptions,
	getRegisteredInterceptors,
	getRegisteredMiddlewares,
	getRegisteredRoutes,
	registerExceptions,
	registerInterceptors,
	registerMiddlewares,
	registerRoutes,
} from '@gaman/core/registry.js';
import { Readable } from 'node:stream';
import { GamanCookies } from '@gaman/core/context/cookies/index.js';
import { ExceptionHandler } from '../exception/index.js';
import { HttpException, InterceptorException } from '@gaman/common/index.js';

export class Router {
	async mountRoutes(rt: Routes) {
		Log.warn(`'app.mountRoutes()' is deprecated, please use the new function 'app.mount()'`)
		registerRoutes(rt);
	}

	/**
	 * @ID Mendaftarkan middleware secara global, sehingga bisa di pakai untuk semua routes.
	 * @EN Register middleware globally, so it can be used for all routes.
	 */
	async mountMiddleware(mw: Middleware | Array<Middleware>) {
		Log.warn(`'app.mountMiddleware()' is deprecated, please use the new function 'app.mount()'`)
		if (Array.isArray(mw)) {
			registerMiddlewares(...mw);
		} else {
			registerMiddlewares(mw);
		}
	}

	async mountExceptionHandler(eh: ExceptionHandler | Array<ExceptionHandler>) {
		Log.warn(`'app.mountExceptionHandler()' is deprecated, please use the new function 'app.mount()'`)
		if (Array.isArray(eh)) {
			registerExceptions(...eh);
		} else {
			registerExceptions(eh);
		}
	}

	async mountInterceptor(ih: Interceptor | Array<Interceptor>) {
		Log.warn(`'app.mountInterceptor()' is deprecated, please use the new function 'app.mount()'`)
		if (Array.isArray(ih)) {
			registerInterceptors(...ih);
		} else {
			registerInterceptors(ih);
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

		// ? mencari route yang cocok
		const { route, params } = this.findRoute(url.pathname, method);
		if (!route?.handler) {
			return await this.handleResponse(
				new Response(undefined, { status: 404 }),
				res,
			);
		}

		const ctx = await createContext(params, req, res);
		Log.setRoute(ctx.request.pathname || '/');
		Log.setMethod(ctx.request.method.toUpperCase());

		try {
			// **** MIDDLEWARE ****
			// ? filter global middlewares dari options kek includes: [] dan excludes: []
			const activeMiddlewares = getRegisteredMiddlewares().filter((mw) =>
				this.shouldRunMiddleware(mw, ctx.request.pathname, ctx.request.method),
			);

			// ? sort by priority global middlewares + route.middlewares
			const sortedMiddlewares = sortArrayByPriority<Middleware>(
				[...activeMiddlewares, ...route.middlewares],
				(mw) => {
					return mw.config.priority;
				},
			);

			// ? Build Pipeline: middleware[] + handler
			const handlers: Array<
				MiddlewareHandler | InterceptorHandler | RequestHandler
			> = [
				...sortedMiddlewares.map((m) => m.handler), // ? middleware harus paling awal
				...getRegisteredInterceptors().map((i) => i.handler),
				...route.pipes
			];

			let index = -1;
			const next = async (i: number): Promise<Response> => {
				if (i <= index) {
					throw new Error('next() called multiple times');
				}
				index = i;
				const fn = handlers[i];
				if (!fn) return new Response(undefined, { status: 404 });
				return await fn(ctx, () => next(i + 1));
			};

			const result = await next(0);
			await this.handleResponse(result as Response, res, ctx);
		} catch (error: any) {
			for (const except of [
				...getRegisteredExceptions(),
				...route.exceptions,
			]) {
				let response;
				if (error.gamanException) {
					response = await except(error);
				} else {
					response = await except(
						new HttpException(error.message, error.status, ctx, error),
					);
				}
				if (response instanceof Response) {
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
						{
							status: error.statusCode,
						},
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

	protected shouldRunMiddleware(
		middleware: Middleware,
		path: string,
		method: string,
	): boolean {
		const config = middleware.config;

		const methodMatch = (
			p: MiddlewareOptions['includes' | 'excludes'][0],
			m: string,
		) => {
			// ? kalau methods kosong di anggap "ALL"
			if (p.methods.length <= 0) {
				return true;
			}

			return p.methods.some((mm) => mm.toUpperCase() === m.toUpperCase());
		};

		// ! check includes: harus ada minimal satu yang match
		if (
			config.includes.length > 0 &&
			!config.includes.some((p) => p.match(path) && methodMatch(p, method))
		) {
			return false;
		}

		// ! check excludes: jika ada yang match, skip
		if (
			config.excludes.length > 0 &&
			config.excludes.some((p) => p.match(path) && methodMatch(p, method))
		) {
			return false;
		}

		return true;
	}

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

		res.statusCode = response.status;
		res.statusMessage = response.statusText;
		res.setHeaders(response.headers.toMap());
		Log.setStatus(response.status);

		if (response.body instanceof Readable) {
			return response.body.pipe(res);
		}
		return res.end(response.body);
	}

	private findRoute(
		path: string,
		method: string,
	): {
		route: Route | undefined;
		params: any;
	} {
		for (const route of getRegisteredRoutes()) {
			const methods = route.methods;
			if (
				!methods.length ||
				methods.includes('ALL') ||
				methods.includes(method.toUpperCase() as any)
			) {
				const result = route.match(path);
				if (result) {
					return { route, params: result.params };
				}
			}
		}

		return { route: undefined, params: {} };
	}
}
