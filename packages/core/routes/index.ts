import { HttpMethod } from '@gaman/common/enums/http-method.enum';
import {
	MiddlewareHandler,
	RequestHandler,
	Route,
	RouteDefinition,
} from '@gaman/common/types';
import { HandlerFactory } from '../handler';

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

	private addRoute<
		T extends Record<string, RequestHandler>,
		F extends HandlerFactory<T>,
	>(
		method: HttpMethod,
		path: string,
		handler: RequestHandler | [fn: F, name: keyof T],
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
			methods: [method],
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

	get<T extends Record<string, RequestHandler>, F extends HandlerFactory<T>>(
		path: string,
		handler: RequestHandler | [fn: F, name: keyof T],
	) {
		return this.addRoute('GET', path, handler);
	}
	post<T extends Record<string, RequestHandler>, F extends HandlerFactory<T>>(
		path: string,
		handler: RequestHandler | [fn: F, name: keyof T],
	) {
		return this.addRoute('POST', path, handler);
	}
	put<T extends Record<string, RequestHandler>, F extends HandlerFactory<T>>(
		path: string,
		handler: RequestHandler | [fn: F, name: keyof T],
	) {
		return this.addRoute('PUT', path, handler);
	}
	delete<T extends Record<string, RequestHandler>, F extends HandlerFactory<T>>(
		path: string,
		handler: RequestHandler | [fn: F, name: keyof T],
	) {
		return this.addRoute('DELETE', path, handler);
	}
	patch<T extends Record<string, RequestHandler>, F extends HandlerFactory<T>>(
		path: string,
		handler: RequestHandler | [fn: F, name: keyof T],
	) {
		return this.addRoute('PATCH', path, handler);
	}
	all<T extends Record<string, RequestHandler>, F extends HandlerFactory<T>>(
		path: string,
		handler: RequestHandler | [fn: F, name: keyof T],
	) {
		return this.addRoute('ALL', path, handler);
	}
	head<T extends Record<string, RequestHandler>, F extends HandlerFactory<T>>(
		path: string,
		handler: RequestHandler | [fn: F, name: keyof T],
	) {
		return this.addRoute('HEAD', path, handler);
	}
	options<
		T extends Record<string, RequestHandler>,
		F extends HandlerFactory<T>,
	>(path: string, handler: RequestHandler | [fn: F, name: keyof T]) {
		return this.addRoute('OPTIONS', path, handler);
	}
}

export function composeRoutes(callback: RouteFactory): Route[] {
	const builder = new RouteBuilder();
	callback(builder);
	return builder.getRoutes();
}

function normalizePath(path: string): string {
	let normalized = path.trim();
	if (!normalized.startsWith('/')) normalized = '/' + normalized;
	normalized = normalized.replace(/\/+$/, '');
	normalized = normalized.replace(/\/+/g, '/');
	return normalized === '' ? '/' : normalized;
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
