import { defineService } from '@gaman/core/service';
import { PrismaClient } from '@prisma/client';

interface Deps {
	prisma: PrismaClient;
}

export default defineService(({ prisma }: Deps) => ({
	create: async (data: { username: string; password: string }) => {
		await prisma.user.create({
			data,
		});
	},
	getId: async (username: string): Promise<number> => {
		const user = await prisma.user.findUnique({
			where: {
				username,
			},
		});
		return user.id;
	},
}));
