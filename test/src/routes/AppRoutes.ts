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
	r.get('/', [MidController, 'Index'])
	r.get('/anu', [MidController, 'Index'])
	r.get('/anu2', [MidController, 'Index'])
	r.get('/anu3', [MidController, 'Index'])
	r.get('/anu4', [MidController, 'Index'])
	r.get('/anu5', [MidController, 'Index'])
	r.get('/anu6', [MidController, 'Index'])
	r.get('/anu7', [MidController, 'Index'])
	r.get('/anu8', [MidController, 'Index'])
	r.get('/anu9', [MidController, 'Index'])
	r.get('/anu10', [MidController, 'Index'])
	r.get('/anu10', [MidController, 'Index'])
	r.group('/user', (r) => {
		r.get('/', [MidController, 'Index'])
		r.get('/setting', [MidController, 'Index'])
		r.get('/:name', [AppController, 'Home']).interceptor(Pipe);
	});
});
