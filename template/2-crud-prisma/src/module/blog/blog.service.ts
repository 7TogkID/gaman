import { defineService } from '@gaman/core/service';
import { PrismaClient } from '@prisma/client';

interface Deps {
	prisma: PrismaClient;
}

export default defineService(({ prisma }: Deps) => ({

	getById: async (id: number) => {
		return await prisma.blog.findUnique({
			where: { id },
		});
	},

	create: async (data: { authorId: number; name: string; content: string }) => {
		await prisma.blog.create({
			data,
		});
	},

	update: async (id: number, data: { name?: string; content?: string }) => {
		await prisma.blog.update({
			where: { id },
			data,
		});
	},

	delete: async (id: number) => {
		await prisma.blog.delete({
			where: { id },
		});
	},
}));
