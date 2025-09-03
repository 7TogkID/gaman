import {
	autoComposeRoutes,
	composeInterceptor,
	composeExceptionHandler,
} from '@gaman/core';
import AppController from '../controllers/AppController';
import { InterceptorException } from '@gaman/common';
import MidController from '../controllers/MidController';

const Pipe = composeInterceptor(async (ctx, next, error) => {
	ctx.transformParams({
		name: `${ctx.param('name')}-anjay `,
	}); 
	// throw error('aduhai  ', 500); 
	const res = await next();
	const body = JSON.parse(res.body);	 
	body['anu'] = 1; 
	res.body = JSON.stringify(body);
	return res;
});

export const ErrorHandle = composeExceptionHandler((err) => {
	if (err instanceof InterceptorException) {
		const ctx = err.context;
		return Res.json({ message: `${err.message}  ${ctx.param('name')}`}, { status: err.statusCode });
	}
});

export default autoComposeRoutes((r) => {
	r.all('/', [MidController, 'Index'])
	r.group('/', (r) => {
		r.get('/:name', [AppController, 'Home']).interceptor(Pipe);
	});
});
