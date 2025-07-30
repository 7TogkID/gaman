import { PrismaClient } from '@prisma/client/extension';
import blogRoutes from './blog.routes.ts';
import { defineBlock } from '@gaman/core/block';

export default defineBlock({
	path: '/blog',
	routes: [blogRoutes],
	depedencies: {
		prisma: new PrismaClient()
	},
	
});
