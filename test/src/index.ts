import { TextFormat } from '@gaman/common';
import { defineBootstrap } from '@gaman/core';
import AppRoutes from './routes/AppRoutes';
import { ejs } from '@gaman/ejs';
import { staticServe } from '@gaman/static';
import AppMiddleware from './middlewares/AppMiddleware';
import { cors } from '@gaman/cors';
import { WebsocketGateway } from '@gaman/websocket';

defineBootstrap(async (app) => {
	app.mount(AppRoutes, ejs(), cors(), staticServe(), AppMiddleware());

	const server = await app.mountServer(':3431');
	WebsocketGateway.upgrade(server)

	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
