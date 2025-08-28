import { IS_INTERCEPTOR_FACTORY } from '@gaman/common/contants.js';
import { InterceptorException } from '@gaman/common/error/index.js';
import {
	InterceptorContext,
	InterceptorErrorFn,
	InterceptorFactory,
	InterceptorHandler,
	Query,
} from '@gaman/common/types/index.js';
import { registerInterceptors } from '@gaman/core/registry.js';

export function autoComposeInterceptor(
	factory: InterceptorFactory,
): InterceptorHandler {
	const handler = composeInterceptor(factory);
	registerInterceptors(handler);
	return handler;
}

export function composeInterceptor(
	factory: InterceptorFactory,
): InterceptorHandler {
	const handler: InterceptorHandler = (ctx, next) => {
		const defaultError: InterceptorErrorFn = (message, statusCode = 400) => {
			return new InterceptorException(message, statusCode, ctx);
		};

		Object.assign(ctx, {
			transformJson(data) {
				ctx.request.json = async () => data;
			},
			transformBody(data) {
				ctx.request.body = async () => data;
			},
			transformFormData(data) {
				ctx.request.formData = async () => data;
			},
			transformHeaders(data) {
				ctx.request.headers = data;
			},
			transformParams(data) {
				ctx.request.params = data;
			},
			transformQuery(data) {
				ctx.request.query = ((name: string) => data[name]) as Query;
				for (const [k, v] of Object.entries(data)) {
					ctx.request.query[k] = v;
				}
			},
			transformText(data) {
				ctx.request.text = async () => data;
			},
		});

		return factory(ctx as InterceptorContext, next, defaultError);
	};

	Object.defineProperty(handler, IS_INTERCEPTOR_FACTORY, {
		value: true,
		writable: false,
		enumerable: false,
	});

	return handler;
}
