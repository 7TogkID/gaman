/**
 * ==========================================================================
 * Gaman Routes
 * ==========================================================================
 *
 * Define your application routes here. Each route maps an HTTP request
 * to a specific controller action. Keep your routes clean, simple,
 * and organized for better maintainability.
 *
 * Example:
 *    r.get('/', [AppController, 'HelloWorld']);
 *
 * For advanced usage, see the documentation:
 * 		https://gaman.7togk.id/docs/overview/routing/
 *
 * ==========================================================================
 */

import { autoComposeRoutes } from '@gaman/core';
import AppController from '../controllers/AppController';

export default autoComposeRoutes((r) => {
	r.get('/', [AppController, 'HelloWorld']);
});
