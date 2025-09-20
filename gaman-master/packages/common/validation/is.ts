import {
	IS_EXCEPTION_HANDLER,
	IS_INTERCEPTOR,
	IS_MIDDLEWARE,
	IS_ROUTES,
} from '@gaman/common/contants.js';
import {
	Interceptor,
	Middleware,
	Routes,
} from '@gaman/common/types/index.js';
import { ExceptionHandler } from '@gaman/core/index.js';

export function isInterceptor(v: any): v is Interceptor {
	return v[IS_INTERCEPTOR] as boolean;
}

export function isMiddleware(v: any): v is Middleware {
	return v[IS_MIDDLEWARE] as boolean;
}

export function isExceptionHandler(v: any): v is ExceptionHandler {
	return v[IS_EXCEPTION_HANDLER] as boolean;
}

export function isRoutes(v: any): v is Routes {
	return v[IS_ROUTES] as boolean;
}
