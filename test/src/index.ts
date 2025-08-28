import { TextFormat } from '@gaman/common/utils';
import { defineBootstrap } from '@gaman/core';
import { ErrorHandle } from './routes/AppRoutes';

defineBootstrap(async (app) => {
	// app.mountExceptionHandler(ErrorHandle)
	await app.mountServer(':3431');
	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
