import { defineRoutes } from '@gaman/core/routes';
import blogService from './blog.service';

interface Deps {
	blogService: ReturnType<typeof blogService>;
}

export default defineRoutes(({ blogService }: Deps) => ({
	'/': {

		// Create new blog
		POST: async ({ json }) => {
			const body = await json<{
				authorId: number;
				name: string;
				content: string;
			}>();
			await blogService.create({
				authorId: body.authorId,
				name: body.name,
				content: body.content,
			});
			return Res.json({
				message: 'Blog created successfully',
			});
		},
	},

	'/:id': {
		// Get one blog with id
		GET: async ({ param }) => {
			return Res.json({
				message: 'OK!',
				data: await blogService.getById(Number(param('id'))),
			});
		},
		
		// Update Blog with id
		PUT: async ({ param, json }) => {
			const id = Number(param('id'));
			const body = await json<{ name: string; content: string }>();
			await blogService.update(id, {
				name: body.name,
				content: body.content,
			});
			return Res.json({
				message: 'Blog updated successfully',
			});
		},

		// Delete Blog with id
		DELETE: async ({ param }) => {
			await blogService.delete(Number(param('id')));
			return Res.json({
				message: 'Blog deleted successfully',
			});
		},
	},
}));
