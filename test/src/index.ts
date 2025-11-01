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
import { jwt } from '@gaman/jwt';
import JwtRoutes from './routes/JwtRoutes';
import { jwtAuthMiddleware } from './middlewares/JwtAuthMiddleware';

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
		jwtAuthMiddleware(),
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

	app.mount(
		jwt({
			secret: 'secret',
			header: 'Authorization',
			required: false,
			includes: ['/jwt/unprotected', '/jwt/token'],
		}),
		jwt({
			secret: 'secret',
			header: 'Authorization',
			required: true,
			includes: ['/jwt/protected'],
			excludes: ['/jwt/unprotected', '/jwt/token'],
		}),
	);

	app.mount(JwtRoutes);

	const server = await app.mountServer(':3431');
	WebsocketGateway.upgrade(server);

	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
