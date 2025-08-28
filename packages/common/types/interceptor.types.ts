import { InterceptorException } from '@gaman/common/error/interceptor-exception.js';
import { Context } from '@gaman/common/types/types.js';
import { Response } from '@gaman/core/response.js';

export type InterceptorNextHandler = Promise<Response> | Response;

export type InterceptorErrorFn = (
	message: string,
	statusCode?: number,
) => InterceptorException;

export interface InterceptorHandler {
	(ctx: Context, next: () => InterceptorNextHandler): InterceptorNextHandler;
}

export type InterceptorFactory = (
	ctx: Context,
	next: () => InterceptorNextHandler,
	error: InterceptorErrorFn,
) => InterceptorNextHandler;
