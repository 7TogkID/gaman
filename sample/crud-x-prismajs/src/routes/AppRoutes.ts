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
import BlogController from '../controllers/BlogController';
import UserController from '../controllers/UserController';

export default autoComposeRoutes((r) => {
	r.get('/', [AppController, 'HelloWorld']);

	/**
	 * USER BLOG
	 */
	r.group('/blog', (r) => {
		r.get('/', [BlogController, 'Index']);
		r.post('/create', [BlogController, 'Create']);

		r.get('/:id/detail', [BlogController, 'Detail']);
		r.put('/:id/update', [BlogController, 'Update']);
		r.delete('/:id/delete', [BlogController, 'Delete']);
	});

	/**
	 * USER ROUTES
	 */
	r.group('/user', (r) => {
		r.get('/', [UserController, 'Index']);
		r.get('/getid/:username', [UserController, 'GetUserId']);

		r.post('/create', [UserController, 'Create']);
	});
});
