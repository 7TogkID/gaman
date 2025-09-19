import { IS_INTERCEPTOR } from '@gaman/common/contants.js';
import interceptorData from '@gaman/common/data/interceptor-data.js';
import { InterceptorException } from '@gaman/common/error/index.js';
import {
	Interceptor,
	InterceptorContext,
	InterceptorErrorFn,
	InterceptorFactory,
	InterceptorHandler,
	Query,
} from '@gaman/common/types/index.js';

export function autoComposeInterceptor(
	factory: InterceptorFactory,
): Interceptor {
	const interceptor = composeInterceptor(factory);
	interceptorData.register(interceptor);
	return interceptor;
}

export function composeInterceptor(factory: InterceptorFactory): Interceptor {
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

	const interceptor = { handler };

	Object.defineProperty(interceptor, IS_INTERCEPTOR, {
		value: true,
		writable: false,
		enumerable: false,
	});

	return interceptor;
}
