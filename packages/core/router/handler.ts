import * as http from 'node:http';
import { createContext } from '@gaman/core/context/index.js';
import {
	Context,
	DefaultMiddlewareOptions,
	InterceptorHandler,
	MiddlewareHandler,
	RequestHandler,
	Route,
} from '@gaman/common/types/index.js';
import {
	IGNORED_LOG_FOR_PATH_REGEX,
	MIDDLEWARE_CONFIG_METADATA,
} from '@gaman/common/contants.js';
import { pathMatch } from '@gaman/common/utils/utils.js';
import { Response } from '@gaman/core/response.js';
import { sortArrayByPriority } from '@gaman/common/utils/index.js';
import {
	getRegisteredMiddlewares,
	getRegisteredRoutes,
} from '@gaman/core/registry.js';
import { Readable } from 'node:stream';
import { GamanCookies } from '@gaman/core/context/cookies/index.js';

export async function requestHandle(
	req: http.IncomingMessage,
	res: http.ServerResponse,
) {
	const startTime = performance.now();
	const method = req.method?.toUpperCase() || 'GET';
	const urlString = req.url || '/';
	const url = new URL(urlString, `http://${req.headers.host}`);

	// ? mencari route yang cocok
	const { route, params } = findRoute(url.pathname, method);
	if (!route?.handler) {
		return await handleResponse(new Response(undefined, { status: 404 }), res);
	}

	const ctx = await createContext(params, req, res);
	Log.setRoute(ctx.request.pathname || '/');
	Log.setMethod(ctx.request.method.toUpperCase());

	try {
		// **** MIDDLEWARE ****
		// ? filter global middlewares dari options kek includes: [] dan excludes: []
		const activeMiddlewares = getRegisteredMiddlewares().filter((mw) =>
			shouldRunMiddleware(mw, ctx.request.pathname),
		);

		// ? sort by priority global middlewares + route.middlewares
		const sortedMiddlewares = sortArrayByPriority<MiddlewareHandler>(
			[...activeMiddlewares, ...route.middlewares],
			(mw) => {
				const mwConfig = mw[
					MIDDLEWARE_CONFIG_METADATA
				] as DefaultMiddlewareOptions;
				return mwConfig.priority || 'normal';
			},
		);

		// ? Build Pipeline: middleware[] + handler
		const handlers: Array<
			MiddlewareHandler | InterceptorHandler | RequestHandler
		> = [
			...sortedMiddlewares, // ? middleware harus paling awal
			...route.interceptors, // ? interceptor harus sebelum handler
			route.handler, // ? final handler
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
		await handleResponse(result as Response, res, ctx);
	} catch (error: any) {
		Log.error(error.message);
		console.error(error.details);
		return await handleResponse(
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

function shouldRunMiddleware(
	middleware: MiddlewareHandler,
	path: string,
): boolean {
	const config = (middleware as any)[MIDDLEWARE_CONFIG_METADATA] || {};
	const includes: string[] = config.includes || [];
	const excludes: string[] = config.excludes || [];

	// ! check includes: harus ada minimal satu yang match
	if (includes.length > 0 && !includes.some((p) => pathMatch(p, path))) {
		return false;
	}

	// ! check excludes: jika ada yang match, skip
	if (excludes.length > 0 && excludes.some((p) => pathMatch(p, path))) {
		return false;
	}

	return true;
}

async function handleResponse(
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

function findRoute(
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
			const match = route.pattern?.regex.exec(path);
			// ? Inject Params dari Pattern
			let params = {};
			route.pattern?.keys.forEach((key, index) => {
				params[key] = match?.[index + 1] || '';
			});
			if (match) return { route, params };
		}
	}

	return { route: undefined, params: {} };
}
