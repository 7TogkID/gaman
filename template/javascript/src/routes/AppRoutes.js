import { autoComposeRoutes } from '@gaman/core';
import AppController from '../controllers/AppController.js';

export default autoComposeRoutes((r) => {
	r.get('/', [AppController, 'HelloWorld']);
});
