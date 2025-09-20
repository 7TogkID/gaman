import { autoComposeExceptionHandler } from '@gaman/core';

export default autoComposeExceptionHandler((err) => {
	Log.error(err);
	return Res.json(
		{
			message: 'Internal server error',
		},
		{ status: 500 },
	);
});
