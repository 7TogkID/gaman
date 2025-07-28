import tesService from 'tes.service.ts';
import mainRoutes from './main.routes.ts';
import mainService from './main.service.ts';
import { defineBlock } from '@gaman/core/block';

export default defineBlock({
	routes: [mainRoutes],
	services: {
		tesService: tesService,
    mainService: mainService,
	},
	depedencies: {
		text: 'Hello, World!',
	},
	path: '/',
});
