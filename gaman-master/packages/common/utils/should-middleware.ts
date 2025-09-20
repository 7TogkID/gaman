import {
	Middleware,
	MiddlewareOptions,
} from '@gaman/common/types/middleware.types.js';

export function shouldRunMiddleware(
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
