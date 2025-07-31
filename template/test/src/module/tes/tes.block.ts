import tesService from "./tes.service.ts";
import tesRoutes from './tes.routes.ts';
import { defineBlock } from '@gaman/core/block';

export default defineBlock({
	path: '/tes',
	routes: [tesRoutes],
	bindings: { tesService: tesService },
});
