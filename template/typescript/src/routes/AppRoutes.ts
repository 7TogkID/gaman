import { autoComposeRoutes } from '@gaman/core';
import AppController from '../controller/AppController';

export default autoComposeRoutes((r) => {
	r.get('/', [AppController, 'HelloWorld']);
});
