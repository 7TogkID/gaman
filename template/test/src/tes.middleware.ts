import { defineMiddleware } from '@gaman/core/middleware';

export default defineMiddleware((c) => {
	Log.info('Middleware');
	return next();
});
