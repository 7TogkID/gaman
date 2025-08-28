import { IS_INTERCEPTOR_FACTOR } from '@gaman/common/contants.js';
import { InterceptorException } from '@gaman/common/error/interceptor-exception.js';
import {
	InterceptorErrorFn,
	InterceptorFactory,
	InterceptorHandler,
} from '@gaman/common/types/index.js';

export function composeInterceptor(
	factory: InterceptorFactory,
): InterceptorHandler {
	const newFactory: InterceptorHandler = (ctx, next) => {
		const defaultError: InterceptorErrorFn = (message, statusCode = 400) => {
			return new InterceptorException(message, statusCode, ctx);
		};

		return factory(ctx, next, defaultError);
	};
	Object.defineProperty(newFactory, IS_INTERCEPTOR_FACTOR, {
		value: true,
		writable: false,
		enumerable: false,
	});
	return newFactory;
}
