import { composeMiddleware } from '@gaman/core';
import { Response } from '@gaman/core/response.js';

export const jwtAuthMiddleware = composeMiddleware(async (ctx, next) => {
	if (ctx.jwt?.required && !ctx.jwt.user) {
		return Response.json({ message: 'Unauthorized' }, { status: 401 });
	}
	return next();
});
