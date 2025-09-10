import { autoComposeMiddleware } from '@gaman/core';

export default autoComposeMiddleware(
	(ctx, next) => {
		// TODO
		Log.info('Midldeware user actived');
		return next();
	},
	{
		includes: ['/user{/*splat}'], // ? for routes user
	},
);
