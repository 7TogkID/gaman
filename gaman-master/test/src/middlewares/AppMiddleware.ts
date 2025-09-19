import { Priority } from '@gaman/common';
import { autoComposeMiddleware, composeMiddleware } from '@gaman/core';

export default composeMiddleware(
	(ctx, next) => {
		// todo something
		console.log('hai');

		return next();
	},
	{
		priority: Priority.MONITOR,
	},
);
