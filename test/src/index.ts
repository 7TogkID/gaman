import { TextFormat } from '@gaman/common';
import { defineBootstrap } from '@gaman/core';
import { cors } from '@gaman/cors';

defineBootstrap(async (app) => {
	app.mountMiddleware(
		cors({
			allowMethods: ['post'],

		}),
	);
	// app.mountExceptionHandler(ErrorHandle)
	await app.mountServer(':3431');
	console.log(process.env.NODE_ENV);
	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
