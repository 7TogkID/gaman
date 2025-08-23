import { normalizePath } from '@gaman/common/utils/utils';
import { RequestHandler } from '../types';
import { HandlerFactory } from '../handler';
import { InterceptorResult } from '../Interceptor';

export type HttpMethod =
	| 'GET' // ? READ
	| 'POST' // ? CREATE
	| 'PUT' // ? UPDATE
	| 'DELETE' // ? DELETE
	| 'PATCH' // ? UPDATE RESOURCE (non-idempotent)
	| 'OPTIONS'
	| 'HEAD'
	| 'TRACE'
	| 'CONNECT';

export interface Route {
	methods: string[];
	path: string | null;
	name?: string;
	pattern?: {
		regex: RegExp;
		keys: string[];
	};
	pipes: InterceptorResult[];
	handler: RequestHandler | null;
}

export type RouteDefinition = {
	method(m: HttpMethod): RouteDefinition;
	methods(...m: HttpMethod[]): RouteDefinition;
	name(s: string): RouteDefinition;
	group(fn: RouteFactory): RouteDefinition;
	pipe(fn: InterceptorResult): RouteDefinition;
	handler(fn: RequestHandler): void;
	handler(hr: HandlerFactory, funcName: string): void;
};

type RouteFactory = (
	route: (path: string, method?: HttpMethod) => RouteDefinition,
) => any;

export function composeRoutes(callback: RouteFactory): Route[] {
	let index = 0;

	// ? ini untuk data sebelum di set
	let preRoute: Route = {
		path: null,
		methods: [],
		pipes: [],
		handler: null,
	};

	const routes: Route[] = [];

	function routeDefinitionFactory(prefix: string = '') {
		return function routeDefinition(p: string): RouteDefinition {
			const fullPath = normalizePath(`${prefix}/${p}`);
			preRoute.path = fullPath;

			const { regex, keys } = compilePath(fullPath);
			preRoute.pattern = { regex, keys };
			
			return {
				group(fn) {
					// ? Pass router baru dengan prefix fullPath
					fn(routeDefinitionFactory(fullPath));
					return this;
				},
				name(s) {
					preRoute.name = s;
					return this;
				},
				methods(...ms: HttpMethod[]) {
					for (const m of ms) {
						preRoute.methods.push(m.toUpperCase());
					}
					return this;
				},
				method(ms: HttpMethod) {
					return this.methods(ms);
				},
				pipe(fn) {
					preRoute.pipes.push(fn);
					return this;
				},
				handler: (fn: RequestHandler | HandlerFactory, funcName?: string) => {
					if (typeof fn === 'function' && !funcName) {
						preRoute.handler = fn as RequestHandler;
					} else if (funcName) {
						const hrr = (fn as HandlerFactory)();
						preRoute.handler = hrr[funcName];
					}

					routes[index++] = { ...preRoute };

					// ? Reset preRoute
					preRoute = {
						path: null,
						methods: [],
						pipes: [],
						handler: null,
					};
				},
			};
		};
	}

	callback(routeDefinitionFactory());
	return routes;
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
