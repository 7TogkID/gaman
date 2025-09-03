/**
 * ==========================================================================
 * Gaman Bootstrap File
 * ==========================================================================
 *
 * Welcome to your GamanJS application! ❤️
 *
 * This file is responsible for bootstrapping your application and
 * starting the HTTP server. By default, it runs on port 3431.
 *
 * Server URL:
 *    http://localhost:3431
 *
 * For the full documentation and more awesome features, visit:
 *    https://gaman.7togk.id/docs/
 *
 * ==========================================================================
 */

import { defineBootstrap } from '@gaman/core';
import { TextFormat } from '@gaman/common';

defineBootstrap(async (app) => {
	await app.mountServer(':3431');
	Log.info(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
