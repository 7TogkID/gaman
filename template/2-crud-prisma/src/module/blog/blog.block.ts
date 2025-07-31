import { PrismaClient } from '@prisma/client';
import blogRoutes from './blog.routes.ts';
import { defineBlock } from '@gaman/core/block';
import blogService from './blog.service.ts';

export default defineBlock({
	path: '/blog',
	routes: [blogRoutes],
	bindings: {
		prisma: new PrismaClient(),
		blogService: blogService
	},
});
