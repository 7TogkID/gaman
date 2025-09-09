import { Route, Routes } from '@gaman/common/types/router.types.js';
import { parse } from 'path-to-regexp';

// ? dynamicRoutes biasanya ada parameter atau custom kek /*splat {/*splat} dll lah itu termasuk dynamic
// ? karna butuh validasi lebih buat nyarinya jadi kita pisahin
const dynamicRoutes: Array<Route> = [];

// ? staticRoutes data static saja kek path /user/setting dan method POST GET dll
// ? benefitnya gampang di cari proses jadi agak cepat
const staticRoutes = new Map<string, Map<string, Route>>();

function isDynamicPath(path: string): boolean {
	const parsed = parse(path);
	const tokens = Array.isArray(parsed) ? parsed : parsed.tokens;
	return tokens.length > 1; 
  // ? Kenapa validasinya length > 1 jika di soalnya  kalau statci tuh cuman gini [ { type: 'text', value: '/anu6' } ]
  // ? nah kalau dinamic banyak [ { type: 'text', value: '/user/' }, { type: 'param', name: 'name' } ]
}

function register(rts: Routes) {
	for (const route of rts) {
		if (isDynamicPath(route.path)) {
			dynamicRoutes.push(route);
			console.log(route.path, ' Dynamic ROUTE');
		} else {
			console.log(route.path, ' Static ROUTE');
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

export default {
	register,
	findRoute,
};
