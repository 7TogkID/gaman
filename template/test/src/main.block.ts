import userBlock from "./module/user/user.block.ts";
import tesBlock from './module/tes/tes.block.ts';
import tesService from 'tes.service.ts';
import mainRoutes from './main.routes.ts';
import mainService from './main.service.ts';
import { defineBlock } from '@gaman/core/block';
import tesMiddleware from 'tes.middleware.ts';
import tesIntegration from 'integration/tes.integration.ts';
import { cors } from '@gaman/cors';

export default defineBlock({
  includes: [tesMiddleware,
  tesIntegration,
  cors({}),
  tesBlock,
  userBlock],
	

	routes: [mainRoutes],
	bindings: {
		tesService,
		mainService,
		text: 'Hello, World!',
	},

	path: '/',
});
