import { defineBlock } from '@gaman/core/block';
import mainRoutes from './main.routes';
import mainService from './main.service';

export default defineBlock({
	path: '/',
	routes: [mainRoutes],
	services: {
		mainService: mainService,
	},
});
