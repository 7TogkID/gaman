import { autoComposeRoutes } from '@gaman/core';
import AppController from '../controller/AppController.js';

export default autoComposeRoutes((r) => {
	r.get('/', [AppController, 'HelloWorld']);
});
