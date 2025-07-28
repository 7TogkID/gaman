import blogService from './blog.service.ts';
import blogRoutes from './blog.routes.ts';
import { defineBlock } from '@gaman/core/block';
import { PrismaClient } from '@prisma/client';

export default defineBlock({
	path: '/blog',
	routes: [blogRoutes],
	depedencies: { prisma: new PrismaClient() },
	services: { blogService: blogService },
	error: () => {
		return Res.json(
			{ message: 'Error get data or create data!' },
			{ status: 500 },
		);
	},
});
