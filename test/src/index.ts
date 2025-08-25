import { TextFormat } from '@gaman/common/utils/textformat';
import { composeMiddleware, composeRoutes, defineBootstrap } from '@gaman/core';
import { composeInterceptor } from '@gaman/core/Interceptor';
import { Response } from '@gaman/core/response';
import { RequestHandler } from '@gaman/common/types';
import { composeHandler } from '@gaman/core/handler';

const MainHandler = composeHandler(() => ({
	CreateHandler(ctx) {
		console.log('PROSES');
		return Res.json({ message: 'OK!' });
	},
}));

const Mid = composeMiddleware(
	(ctx, next) => {
		Log.log('Middleware works pertama');
		return next();
	},
	{
		priority: 'low',
	},
);

const MidSecond = composeMiddleware(
	async (ctx, next) => {
		Log.log('Middleware works kedua');
		return await next();
	},
	{
		priority: 'high',
	},
);

const Pipe = composeInterceptor(async (ctx, next, error) => {
	console.log('anu');
	ctx.locals.example = 'ANU';
	const res = await next();
	console.log('anu2');
	console.log(res.body);
	if (res instanceof Response) {
		console.log(res);
	}
	return res;
});

const Get: RequestHandler = (ctx) => {
	Log.log('PROCESS');
	return Res.json({ message: ctx.locals.example });
};

const Routes = composeRoutes((r) => {
	r.group('/', (r) => {
		r.get('/', [MainHandler, "CreateHandler"]);
	})
		.interceptor(Pipe)
		.middleware([MidSecond()]);
});

defineBootstrap(async (app) => {
	app.mountRoutes(Routes);
	app.mountMiddleware(
		Mid({
			priority: 'low',
			excludes: [],
		}),
	);

	await app.listen(3431);
	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
