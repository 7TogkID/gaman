import userService from './user.service.ts';
import userRoutes from './user.routes.ts';
import { defineBlock } from '@gaman/core/block';
import { PrismaClient } from '@prisma/client';

export default defineBlock({
	services: { userService: userService },
	depedencies: { prisma: new PrismaClient() },
	path: '/user',
	routes: [userRoutes],
	error: () => {
		return Res.json(
			{ message: 'Error get data or create data!' },
			{ status: 500 },
		);
	},
});
