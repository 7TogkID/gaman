import { defineBootstrap } from '@gaman/core';
import mainBlock from './main.block';
import { TextFormat } from '@gaman/common/utils/textformat';

defineBootstrap(mainBlock, async (app) => {
	app.setStrict(false) // <-- setStrict(true) if you want use strict mode

	app.listen(3431, 'localhost', () => {
		Log.log(
			`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
		);
	});
});
