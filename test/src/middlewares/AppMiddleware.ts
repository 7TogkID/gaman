import { autoComposeMiddleware } from '@gaman/core';

export default autoComposeMiddleware(
	(ctx, next) => {
		// todo something
		console.log('hai');

		return next();
	},
	{
		priority: 'high',
		includes: [
			{
				path: '/user{/*splat}',
			},
			'/anu',
		],
	},
);
