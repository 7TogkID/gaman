import { composeRoutes } from '@gaman/core';

export default composeRoutes((r) => {
	r.get('/jwt/token', (ctx) => {
		const token = ctx.jwt.sign({ userId: 'test-user' });

		return Res.json(
			{ token: token },
			{
				status: 200,
			},
		);
	});

	r.get('/jwt/protected', (ctx) => {
		const token =
			ctx.request.header('authorization')?.replace('Bearer ', '') || '';

		const user = ctx.jwt.verify(token);

		return Res.json(
			{ user },
			{
				status: 200,
			},
		);
	});

	r.get('/jwt/unprotected', (ctx) => {
		return Res.json(
			{ message: 'Unprotected' },
			{
				status: 200,
			},
		);
	});
});
