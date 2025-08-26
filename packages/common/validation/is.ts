import {
	IS_INTERCEPTOR_FACTOR,
	IS_MIDDLEWARE_FACTORY,
} from '@gaman/common/contants';
import {
	InterceptorHandler,
	MiddlewareHandler,
} from '@gaman/common/types';

export function isInterceptorHandler(v: any): v is InterceptorHandler {
	return v[IS_INTERCEPTOR_FACTOR] as boolean;
}

export function isMiddlewareHandler(v: any): v is MiddlewareHandler {
	return v[IS_MIDDLEWARE_FACTORY] as boolean;
}
