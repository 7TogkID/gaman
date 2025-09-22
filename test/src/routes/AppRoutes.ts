import {
	autoComposeRoutes,
	composeInterceptor,
	composeExceptionHandler,
	composeRoutes,
} from '@gaman/core';
import AppController from '../controllers/AppController';
import { InterceptorException } from '@gaman/common';
import MidController from '../controllers/MidController';
import { basicAuth } from '@gaman/basic-auth';
import AppWebsocket from '../AppWebsocket';
import TesWSMiddleware from '../middlewares/TesWSMiddleware';

export const Pipe = composeInterceptor(async (ctx, next, error) => {
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
		return Res.json(
			{ message: `${err.message}  ${ctx.param('name')}` },
			{ status: err.statusCode },
		);
	}
	console.error(err);
	return Res.json(
		{
			message: 'Internal server error!',
		},
		{ status: 500 },
	);
});

export default composeRoutes((r) => {
	r.ws('/', AppWebsocket).middleware(TesWSMiddleware());

	r.get('/', (ctx) => {
		return Res.json({ message: ' ADUH' }, 403);
	});

	r.get('session', async (ctx) => {
		const value = await ctx.session.get();
		if (value) {
			console.log('ada', value.userId);
		} else {
			await ctx.session.set({ userId: 'abogoboga' });
		}

		return Res.json({ message: 'OK!' });
	});

	r.get('/anu', [MidController, 'Index']);
	r.get('/anu2', [MidController, 'Index']);
	r.get('/anu3', [MidController, 'Index']);
	r.get('/anu4', [MidController, 'Index']);
	r.get('/anu5', [MidController, 'Index']);
	r.get('/anu6', [MidController, 'Index']);
	r.get('/anu7', [MidController, 'Index']);
	r.get('/anu8', [MidController, 'Index']);
	r.get('/anu9', [MidController, 'Index']);
	r.get('/anu10', [MidController, 'Index']);
	r.get('/anu10', [MidController, 'Index']);
	r.group('/user', (r) => {
		r.get('/', (ctx) => {
			return Res.text('ini get');
		});
		r.post('/', (ctx) => {
			return Res.text('ini post');
		});
		r.get('/setting', [MidController, 'Index']);
		r.get('/:name', [AppController, 'Home']);
	})
		.exception(ErrorHandle)
		.interceptor(Pipe);
});
