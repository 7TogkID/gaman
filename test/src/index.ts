import { TextFormat } from '@gaman/common';
import { defineBootstrap } from '@gaman/core';
import AppRoutes from './routes/AppRoutes';
import { ejs } from '@gaman/ejs';
import { staticServe } from '@gaman/static';
import AppMiddleware from './middlewares/AppMiddleware';

defineBootstrap(async (app) => {
	app.mount(AppRoutes, ejs(), staticServe(), AppMiddleware());

	await app.mountServer(':3431');
	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
