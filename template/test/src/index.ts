import { TextFormat } from '@gaman/common/utils/textformat';
import { defineBootstrap } from '@gaman/core';
import Routes from 'routes/Routes';

defineBootstrap(async (app) => {
	app.mountRoutes(Routes);

	await app.listen(3431);
	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
