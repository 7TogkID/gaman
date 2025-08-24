import { TextFormat } from '@gaman/common/utils/textformat';
import { composeMiddleware, composeRoutes, defineBootstrap } from '@gaman/core';

const Routes = composeRoutes((route) => {
	route('/').handler(() => {
		return Res.json({
			message: 'OK!',
		});
	});
});

defineBootstrap(async (app) => {
	app.mountRoutes(Routes);

	await app.listen(3431);
	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
