import { defineBootstrap } from '@gaman/core';
import { TextFormat } from '@gaman/common/utils/textformat';

defineBootstrap(async (app) => {
	await app.mountServer(':3431');
	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
