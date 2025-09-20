import { composeController } from '@gaman/core';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default composeController(() => ({
  
  /**
   * Controller Saerch User
   */
	async Index(ctx) {
		const result = await prisma.user.findMany({
			where: {
				username: {
					contains: ctx.query('q'),
				},
			},
		});
		return Res.json({
			message: 'OK!',
			data: result,
		});
	},

	/**
	 * Controller Create User
	 */
	async Create(ctx) {
		const { username, password } = await ctx.json();
		if (!username || !password) {
			return Res.json(
				{
					message: "'username' and 'password' required!",
				},
				{ status: 400 },
			);
		}
		const result = prisma.user.create({
			data: {
				username,
				password: bcrypt.hashSync(password, 10),
			},
		});
		return Res.json({
			message: 'user created!',
			data: result,
		});
	},

	/**
	 * Controller Get ID User By username
	 */
	async GetUserId(ctx) {
		const { username } = ctx.params;
		if (!username) {
			return Res.json(
				{
					message: 'user not found!',
				},
				{ status: 404 },
			);
		}

		const user = await prisma.user.findUnique({
			where: {
				username,
			},
		});
		if (!user) {
			return Res.json(
				{
					message: 'user not found!',
				},
				{ status: 404 },
			);
		}
		return Res.json({
			message: 'OK!',
			data: user.id,
		});
	},
}));
