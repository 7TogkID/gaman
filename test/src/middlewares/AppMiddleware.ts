import { autoComposeMiddleware } from '@gaman/core';

export default autoComposeMiddleware(
	(ctx, next) => {
		// todo something
		return next();
	},
	{ priority: 'high' },
);
