import type { Context, NextResponse } from '@gaman/core/types';
import * as http from 'node:http';
import { Log } from '@gaman/common/utils/logger';
import { createContext } from '@gaman/core/context';
import { isHtmlString, pathMatch } from '@gaman/common/utils/utils';
import { Response } from '@gaman/core/response';
import { sortArrayByPriority } from '@gaman/common/utils/priority';
import { performance } from 'perf_hooks';
import { Readable } from 'node:stream';
import { GamanCookies } from '@gaman/core/context/cookies';
import { IntegrationFactory } from '@gaman/core/integration';
import { loadEnv } from '@gaman/common/utils/load-env';
import { Route } from '@gaman/core/routes';
import {
	HTTP_RESPONSE_SYMBOL,
	IGNORED_LOG_FOR_PATH_REGEX,
	MIDDLEWARE_CONFIG_METADATA,
} from '@gaman/common/contants';
import { MiddlewareHandler } from '@gaman/core/middleware';

export class GamanApp {
	middlewares: MiddlewareHandler[] = [];
	routes: Route[] = [];
	integrations: Array<ReturnType<IntegrationFactory>> = [];
	server: http.Server<
		typeof http.IncomingMessage,
		typeof http.ServerResponse
	> | null = null;
	strict = false;
	silent = false;

	setStrict(v: boolean = true) {
		this.strict = v;
	}

	setSilent(v: boolean = true) {
		this.silent = v;
	}

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

	mountMiddleware(middleware: MiddlewareHandler) {
		this.middlewares.push(middleware);
	}

	loadEnv(envPath = '.env') {
		loadEnv(envPath);
	}

	/** ✅ Register Middleware */
	use(middleware: MiddlewareHandler) {
		this.middlewares.push(middleware);
	}

	/** ✅ Pipeline Request Handler */
	private async requestHandle(
		req: http.IncomingMessage,
		res: http.ServerResponse,
	) {
		const startTime = performance.now();
		const ctx = await createContext(this, req, res);
		Log.setRoute(ctx.request.pathname || '/');
		Log.setMethod(ctx.request.method.toUpperCase());

		try {
			// ? mencari route yang cocok
			const route = this.findRoute(ctx.request.pathname, ctx.request.method);
			if (!route?.handler) {
				return await this.handleResponse(
					new Response(undefined, { status: 404 }),
					ctx,
				);
			}

			// ? Inject Params dari Pattern
			const match = route.pattern?.regex.exec(ctx.request.pathname);
			route.pattern?.keys.forEach((key, index) => {
				ctx.params[key] = match?.[index + 1] || '';
			});

			// ? Build Pipeline: middleware[] + handler
			const activeMiddlewares = this.middlewares.filter((mw) =>
				this.shouldRunMiddleware(mw, ctx.request.pathname),
			);
			const handlers = [...activeMiddlewares, route.handler];

			let index = -1;
			const next = async (i: number): Promise<NextResponse> => {
				if (i <= index) throw new Error('next() called multiple times');
				index = i;
				const fn = handlers[i];
				if (!fn) return;

				return await fn(ctx, () => next(i + 1));
			};

			const result = await next(0);
			await this.handleResponse(result, ctx);
		} catch (error: any) {
			Log.error(error.message);
			console.error(error.details);
			return await this.handleResponse(
				new Response(undefined, { status: 500 }),
				ctx,
			);
		} finally {
			const endTime = performance.now();
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
		if (res.writableEnded) return;

		const isResponse = (value: unknown): value is Response => {
			return value instanceof Response;
		};

		let response: Response = new Response(undefined, { status: 404 });

		if (isResponse(result)) {
			response = result;
		} else {
			if (typeof result === 'string') {
				if (isHtmlString(result)) {
					response = Response.html(result, { status: 200 });
				} else {
					response = Response.text(result, { status: 200 });
				}
			} else if (result) {
				response = Response.json(result, { status: 200 });
			}
		}

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

		for (const [key, value] of ctx.headers.entries()) {
			if (value[1] == true) {
				response.headers.set(key, value[0]);
			}
		}

		const cookieHeaders = Array.from(GamanCookies.consume(ctx.cookies));
		if (cookieHeaders.length > 0) {
			response.headers.set('Set-Cookie', cookieHeaders);
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

	shouldRunMiddleware(middleware: MiddlewareHandler, path: string): boolean {
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

	async listen(port?: number, host?: string): Promise<void> {
		this.server = http.createServer(this.requestHandle.bind(this));
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

	private findRoute(path: string, method: string): Route | undefined {
		for (const route of this.routes) {
			const methods = route.methods;
			if (!methods.length || methods.includes(method.toUpperCase())) {
				const match = route.pattern?.regex.exec(path);
				if (match) return route;
			}
		}
		return undefined;
	}
}
