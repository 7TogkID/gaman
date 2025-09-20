import { composeController } from '@gaman/core';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default composeController(() => ({
	/**
	 * Controller Search Blog
	 */
	async Index({ query }) {
		const result = await prisma.blog.findMany({
			where: {
				name: {
					contains: query('q'),
				},
			},
		});
		return Res.json({
			message: 'OK!',
			data: result,
		});
	},

	/**
	 * Controller Get Detail Blog
	 */
	async Detail({ param }) {
		const id = Number(param('id'));
		if (!id) {
			return Res.json(
				{
					message: "'id' cannot be empty",
				},
				{ status: 400 },
			);
		}

		const result = await prisma.blog.findUnique({
			where: { id },
		});
		if (!result) {
			return Res.json(
				{
					message: 'Blog not found!',
				},
				{ status: 400 },
			);
		}
		return Res.json({
			message: 'OK!',
			data: result,
		});
	},

	/**
	 * Controller Create Blog
	 */
	async Create(ctx) {
		const { authorId, name, content } = await ctx.json();

		if (!authorId || !name || !content) {
			return Res.json(
				{
					message: "'authorId', 'name', and 'content' required!",
				},
				{ status: 400 },
			);
		}

		try {
			const result = await prisma.blog.create({
				data: {
					authorId,
					name,
					content,
				},
			});
			return Res.json({
				message: 'blog created!',
				data: result,
			});
		} catch (error) {
			Log.error(error);
			return Res.json(
				{
					message: 'blog already exists!',
				},
				{ status: 400 },
			);
		}
	},

	/**
	 * Controller Update Blog
	 */
	async Update(ctx) {
		const id = Number(ctx.param('id'));
		if (!id) {
			return Res.json(
				{
					message: "'id' required!",
				},
				{ status: 400 },
			);
		}

		const { name, content } = await ctx.json();
		if (!name || !content) {
			return Res.json(
				{
					message: "'name' and 'content' required!",
				},
				{ status: 400 },
			);
		}

		const found = await prisma.blog.findUnique({
			where: {
				id,
			},
		});
		if (!found) {
			return Res.json(
				{
					message: 'Blog not found!',
				},
				{ status: 400 },
			);
		}

		const result = await prisma.blog.update({
			where: {
				id,
			},
			data: {
				content,
				name,
			},
		});
		return Res.json({
			message: 'blog updated!',
			data: result,
		});
	},

	/**
	 * Controller Delete Blog
	 */
	async Delete(ctx) {
		const id = Number(ctx.param('id'));
		if (!id) {
			return Res.json(
				{
					message: "'id' required!",
				},
				{ status: 400 },
			);
		}

		const found = await prisma.blog.findUnique({
			where: {
				id,
			},
		});
		if (!found) {
			return Res.json(
				{
					message: 'Blog not found!',
				},
				{ status: 400 },
			);
		}

		await prisma.blog.delete({
			where: {
				id,
			},
		});
		return Res.json({
			message: 'blog deleted!',
		});
	},
}));
