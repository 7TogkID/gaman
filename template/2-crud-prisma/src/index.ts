import { defineBootstrap } from '@gaman/core';
import mainBlock from './main.block';
import { TextFormat } from '@gaman/common/utils/textformat';

defineBootstrap(mainBlock, async (app) => {
	app.setStrict(false);

	await app.listen(3431);
	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
