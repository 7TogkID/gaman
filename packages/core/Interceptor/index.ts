import { InterceptorException } from '@gaman/common/error/interceptor-exception';
import { Context } from '@gaman/core/types';

export type InterceptorErrorFn = (
	message: string,
	statusCode?: number,
) => InterceptorException;

export type InterceptorResult<T = unknown> = (ctx: Context) => T | Promise<T>;

export type InterceptorFactory<T = unknown> = (
	ctx: Context,
	error: InterceptorErrorFn,
) => T | Promise<T>;

export function composeInterceptor<T = unknown>(
	factory: InterceptorFactory<T>,
): InterceptorResult {
	return (ctx) => {
		const defaultError: InterceptorErrorFn = (message, statusCode = 400) => {
			return new InterceptorException(message, statusCode, ctx);
		};

		return factory(ctx, defaultError);
	};
}
