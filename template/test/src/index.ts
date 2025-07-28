import { TextFormat } from '@gaman/common/utils/textformat';
import mainBlock from './main.block';
import { defineBootstrap } from '@gaman/core';

defineBootstrap(mainBlock, async (app) => {
	app.listen(3431, 'localhost', () => {
		Log.log(
			`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
		);
	});
});
