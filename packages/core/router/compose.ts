import { HttpMethod } from '@gaman/common/enums/http-method.enum.js';
import {
	MiddlewareHandler,
	RequestHandler,
	Route,
	RouteDefinition,
} from '@gaman/common/types/index.js';
import { ControllerFactory } from '@gaman/common/types/controller.types.js';
import { normalizePath } from '@gaman/common/utils/utils.js';
import { registerRoutes } from '@gaman/core/registry.js';

type RouteFactory = (route: RouteBuilder) => void;
class RouteBuilder {
	private prefix: string;
	// ? Pipeline Request Handler
	private middlewares: MiddlewareHandler[] = [];
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
		handler: RequestHandler | [fn: ControllerFactory, name: string],
	): RouteDefinition {
		const fullPath = normalizePath(`${this.prefix}/${path}`);
		const { regex, keys } = compilePath(fullPath);

		let finalHandler: RequestHandler;

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
		} else {
			finalHandler = handler;
		}

		const route: Route = {
			path: fullPath,
			methods: Array.isArray(method) ? method : [method],
			handler: finalHandler,
			middlewares: [...this.middlewares],
			interceptors: [],
			pattern: { regex, keys },
		};

		this.routes.push(route);

		return {
			middleware(fn) {
				if (Array.isArray(fn)) {
					route.middlewares.push(...fn);
				} else {
					route.middlewares.push(fn);
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
						r.middlewares.unshift(...fn);
					} else {
						r.middlewares.unshift(fn);
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
}

export function autoComposeRoutes(callback: RouteFactory): Route[] {
	const routes = composeRoutes(callback);
	registerRoutes(...routes);
	return routes;
}

export function composeRoutes(callback: RouteFactory): Route[] {
	const builder = new RouteBuilder();
	callback(builder);
	return builder.getRoutes();
}

function compilePath(pattern: string): { regex: RegExp; keys: string[] } {
	const keys: string[] = [];
	const regexPattern = pattern
		.replace(/\/:(\w+)/g, (_: string, key: string) => {
			keys.push(key);
			return '/(?<' + key + '>[^/]+)';
		})
		.replace(/\//g, '\\/');
	return {
		regex: new RegExp(`^${regexPattern}$`),
		keys,
	};
}
