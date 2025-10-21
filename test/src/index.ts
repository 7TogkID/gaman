import { TextFormat } from '@gaman/common';
import { defineBootstrap } from '@gaman/core';
import AppRoutes from './routes/AppRoutes';
import { staticServe } from '@gaman/static';
import AppMiddleware from './middlewares/AppMiddleware';
import { cors } from '@gaman/cors';
import { WebsocketGateway } from '@gaman/websocket';
import { session } from '@gaman/session';
import { edge } from '@gaman/edge';
import EdgeHandler from './EdgeHandler';

defineBootstrap(async (app) => {
	app.mount(
		AppRoutes,
		edge({
			handler: EdgeHandler,
		}),
		cors({
			origin: ['http://127.0.0.1:5500'],
			credentials: true,
		}),
		staticServe(),
		AppMiddleware(),
	);

	const sessionData: Record<string, any> = {};
	app.mount(
		session({
			crossSite: true,
			store: {
				async delete(data) {
					delete sessionData[data.sid];
				},
				async get(data) {
					return sessionData[data.sid];
				},
				async set(data) {
					sessionData[data.sid] = data.payload;
				},
			},
		}),
	);

	const server = await app.mountServer(':3431');
	WebsocketGateway.upgrade(server);

	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
