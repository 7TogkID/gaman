import { InterceptorException } from '@gaman/common/error/interceptor-exception.js';
import { Context, QueryValue } from '@gaman/common/types/types.js';
import { GamanHeader } from '@gaman/core/headers/index.js';
import { FormData } from '@gaman/core/index.js';
import { Response } from '@gaman/core/response.js';

export type InterceptorNextHandler = Promise<Response> | Response;

export interface InterceptorContext extends Context {
	transformJson: (data: any) => void;
	transformFormData: (data: FormData) => void;
	transformParams: (data: Record<string, any>) => void;
	transformQuery: (data: Record<string, QueryValue>) => void;
	transformHeaders: (data: GamanHeader) => void;
	transformBody: (data: Buffer<ArrayBufferLike>) => void;
	transformText: (data: string) => void;
}

export type InterceptorErrorFn = (
	message: string,
	statusCode?: number,
) => InterceptorException;

export interface InterceptorHandler {
	(ctx: Context, next: () => InterceptorNextHandler): InterceptorNextHandler;
}

export type InterceptorFactory = (
	ctx: InterceptorContext,
	next: () => InterceptorNextHandler,
	error: InterceptorErrorFn,
) => InterceptorNextHandler;
