import {
	IS_COMPOSE_HANDLER_FACTORY,
	IS_COMPOSE_INTERCEPTOR_FACTORY,
} from '@gaman/common/contants';
import {
	InterceptorHandler,
	MiddlewareHandler,
} from '@gaman/common/types';

export function isInterceptorHandler(v: any): v is InterceptorHandler {
	return v[IS_COMPOSE_INTERCEPTOR_FACTORY] as boolean;
}

export function isMiddlewareHandler(v: any): v is MiddlewareHandler {
	return v[IS_COMPOSE_HANDLER_FACTORY] as boolean;
}
