import {
	IS_INTERCEPTOR_FACTORY,
	IS_MIDDLEWARE_FACTORY,
} from '@gaman/common/contants.js';
import {
	InterceptorHandler,
	MiddlewareHandler,
} from '@gaman/common/types/index.js';

export function isInterceptorHandler(v: any): v is InterceptorHandler {
	return v[IS_INTERCEPTOR_FACTORY] as boolean;
}

export function isMiddlewareHandler(v: any): v is MiddlewareHandler {
	return v[IS_MIDDLEWARE_FACTORY] as boolean;
}
