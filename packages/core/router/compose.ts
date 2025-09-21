import { HttpMethod } from '@gaman/common/enums/http-method.enum.js';
import {
	InterceptorHandler,
	Middleware,
	MiddlewareHandler,
	RequestHandler,
	Route,
	RouteDefinition,
	Routes,
} from '@gaman/common/types/index.js';
import { ControllerFactory } from '@gaman/common/types/controller.types.js';
import { normalizePath } from '@gaman/common/utils/utils.js';
import { match } from 'path-to-regexp';
import { IS_ROUTES } from '@gaman/common/contants.js';
import { sortArrayByPriority } from '@gaman/common/index.js';
import routesData from '@gaman/common/data/routes-data.js';
import {
	Websocket,
	WebsocketMiddleware,
} from '@gaman/common/types/websocket.types.js';
import {
	isWebsocket,
	isWebsocketMiddleware,
} from '@gaman/common/validation/is.js';

type RouteFactory = (route: RouteBuilder) => void;
class RouteBuilder {
	private prefix: string;
	// ? Pipeline Request Handler
	private middlewares: Middleware[] = [];
	private websocketMiddlewares: WebsocketMiddleware[] = [];
	private routes: Route[] = [];

	constructor(prefix: string = '') {
		this.prefix = prefix;
	}

	getRoutes() {
		return this.routes;
	}

	private addRoute(
		method: HttpMethod | HttpMethod[],
		path: string,
		handler: RequestHandler | Websocket | [fn: ControllerFactory, name: string],
	): RouteDefinition {
		const fullPath = normalizePath(`${this.prefix}/${path}`);

		let finalHandler: RequestHandler | null = null;
		let finalWebsocket: Websocket | null = null;

		if (Array.isArray(handler)) {
			const [fn, name] = handler;
			const instance = fn();
			const maybeHandler = instance[name];
			if (typeof maybeHandler !== 'function') {
				throw new Error(
					`Handler ${String(name)} is not a function in factory result`,
				);
			}
			finalHandler = maybeHandler as RequestHandler;
		} else if (isWebsocket(handler)) {
			finalWebsocket = handler;
		} else {
			finalHandler = handler;
		}

		const route: Route = {
			path: fullPath,
			methods: Array.isArray(method) ? method : [method],
			handler: finalHandler,
			websocket: finalWebsocket,
			websocketMiddlewares: [...this.websocketMiddlewares],
			middlewares: [...this.middlewares],
			exceptions: [],
			interceptors: [],
			pipes: [],
			match: match(fullPath),
		};

		this.routes.push(route);

		return {
			middleware(fn) {
				if (Array.isArray(fn)) {
					for (const mw of fn) {
						if (isWebsocketMiddleware(mw)) {
							route.websocketMiddlewares.push(mw);
						} else {
							route.middlewares.push(mw);
						}
					}
				} else {
					if (isWebsocketMiddleware(fn)) {
						route.websocketMiddlewares.push(fn);
					} else {
						route.middlewares.push(fn);
					}
				}
				return this;
			},
			interceptor(fn) {
				if (Array.isArray(fn)) {
					route.interceptors.push(...fn);
				} else {
					route.interceptors.push(fn);
				}
				return this;
			},
			exception(eh) {
				if (Array.isArray(eh)) {
					route.exceptions.push(...eh);
				} else {
					route.exceptions.push(eh);
				}
				return this;
			},
			name(s) {
				route.name = s;
				return this;
			},
		};
	}

	group(prefix: string, callback: (r: RouteBuilder) => void): RouteDefinition {
		const newBuilder = new RouteBuilder(
			normalizePath(`${this.prefix}/${prefix}`),
		);
		callback(newBuilder);
		const childRoutes = newBuilder.getRoutes();
		this.routes.push(...childRoutes);
		return {
			middleware(fn) {
				for (const r of childRoutes) {
					/**
					 * ? Apply group middleware to all
					 */
					if (Array.isArray(fn)) {
						for (const mw of fn) {
							if (isWebsocketMiddleware(mw)) {
								r.websocketMiddlewares.push(mw);
							} else {
								r.middlewares.push(mw);
							}
						}
					} else {
						if (isWebsocketMiddleware(fn)) {
							r.websocketMiddlewares.push(fn);
						} else {
							r.middlewares.push(fn);
						}
					}
				}
				return this;
			},
			interceptor(fn) {
				for (const r of childRoutes) {
					if (Array.isArray(fn)) {
						r.interceptors.unshift(...fn);
					} else {
						r.interceptors.unshift(fn);
					}
				}
				return this;
			},
			exception(eh) {
				for (const r of childRoutes) {
					if (Array.isArray(eh)) {
						r.exceptions.unshift(...eh);
					} else {
						r.exceptions.unshift(eh);
					}
				}
				return this;
			},
			name() {
				return this;
			},
		};
	}

	get(
		path: string,
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	) {
		return this.addRoute('GET', path, handler);
	}
	post(
		path: string,
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	) {
		return this.addRoute('POST', path, handler);
	}
	put(
		path: string,
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	) {
		return this.addRoute('PUT', path, handler);
	}
	delete(
		path: string,
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	) {
		return this.addRoute('DELETE', path, handler);
	}
	patch(
		path: string,
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	) {
		return this.addRoute('PATCH', path, handler);
	}
	all(
		path: string,
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	) {
		return this.addRoute('ALL', path, handler);
	}
	head(
		path: string,
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	) {
		return this.addRoute('HEAD', path, handler);
	}
	options(
		path: string,
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	) {
		return this.addRoute('OPTIONS', path, handler);
	}
	match(
		methods: HttpMethod[],
		path: string,
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	) {
		return this.addRoute(methods, path, handler);
	}
	ws(
		path: string,
		websocket: Websocket,
	): Pick<RouteDefinition, 'middleware' | 'name'> {
		return this.addRoute([], path, websocket);
	}
}

export function autoComposeRoutes(callback: RouteFactory): Routes {
	const routes = composeRoutes(callback);
	routesData.register(routes);
	return routes;
}

export function composeRoutes(callback: RouteFactory): Routes {
	const builder = new RouteBuilder();
	callback(builder);

	const routes = builder.getRoutes();

	const useable_routes = routes.map((r) => {
		const sortedMiddlewares = sortArrayByPriority<Middleware>(
			r.middlewares,
			(mw) => {
				return mw.config.priority;
			},
		);

		const pipes: Array<
			MiddlewareHandler | InterceptorHandler | RequestHandler
		> = [
			...sortedMiddlewares.map((i) => i.handler),
			...r.interceptors.map((i) => i.handler), // ? lalu interceptor
		];

		if (r.handler) {
			pipes.push(r.handler); // ? final handler
		}

		return {
			...r,
			pipes,
		};
	});

	Object.defineProperty(useable_routes, IS_ROUTES, {
		value: true,
		writable: false,
		enumerable: false,
	});
	return useable_routes;
}
