import { Route, Routes } from '@gaman/common/types/router.types.js';
import { parse } from 'path-to-regexp';

// ? dynamicRoutes biasanya ada parameter atau custom kek /*splat {/*splat} dll lah itu termasuk dynamic
// ? karna butuh validasi lebih buat nyarinya jadi kita pisahin
const dynamicRoutes: Array<Route> = [];

// ? staticRoutes data static saja kek path /user/setting dan method POST GET dll
// ? benefitnya gampang di cari proses jadi agak cepat
const staticRoutes = new Map<string, Map<string, Route>>();

const websocketRoutes = new Map<string, Route>();


const pathCheckCache = new Map<string, boolean>();
function isDynamicPath(path: string): boolean {
	const cached = pathCheckCache.get(path);
	if (cached !== undefined) return cached; // ? if have cache

	const parsed = parse(path); // !
	const tokens = Array.isArray(parsed) ? parsed : parsed.tokens;

	// ? Kenapa validasinya length > 1 jika di soalnya  kalau statci tuh cuman gini [ { type: 'text', value: '/anu6' } ]
	// ? nah kalau dinamic banyak [ { type: 'text', value: '/user/' }, { type: 'param', name: 'name' } ]
	const result = tokens.length > 1;
	pathCheckCache.set(path, result); // ! set to cache

	return result;
}

function register(rts: Routes) {
	for (const route of rts) {
		if (route.websocket) {
			websocketRoutes.set(route.path, route);
		} else if (isDynamicPath(route.path)) {
			dynamicRoutes.push(route);
		} else {
			if (!staticRoutes.has(route.path)) {
				staticRoutes.set(route.path, new Map());
			}
			const methodsMap = staticRoutes.get(route.path)!;

			if (route.methods.length === 0 || route.methods.includes('ALL')) {
				// ! Simpan 'ALL' sebagai fallback
				methodsMap.set('ALL', route);
			} else {
				for (const method of route.methods) {
					methodsMap.set(method.toUpperCase(), route);
				}
			}
		}
	}
}

function findRoute(
	path: string,
	method: string,
): { route: Route | undefined; params: any } {
	// * 1. cek static
	const methodsMap = staticRoutes.get(path);
	if (methodsMap) {
		const route = methodsMap.get(method.toUpperCase()) || methodsMap.get('ALL');
		if (route) return { route, params: {} };
	}

	// * 2. cek dynamic
	for (const route of dynamicRoutes) {
		if (
			!route.methods.length ||
			route.methods.includes('ALL') ||
			route.methods.includes(method.toUpperCase() as any)
		) {
			const result = route.match(path);
			if (result) {
				return { route, params: result.params };
			}
		}
	}

	return { route: undefined, params: {} };
}

function findWebsocketRoute(path: string): Route | undefined {
	return websocketRoutes.get(path);
}

export default {
	register,
	findRoute,
	findWebsocketRoute,
};
