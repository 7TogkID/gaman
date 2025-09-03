import { autoComposeRoutes } from '@gaman/core';
import AppController from '../controllers/AppController';

export default autoComposeRoutes((r) => {
	r.get('/', [AppController, 'HelloWorld']);
});