import { defineRoutes } from '@gaman/core/routes';
import userService from './user.service';

interface Deps {
	userService: ReturnType<typeof userService>;
}

export default defineRoutes(({ userService }: Deps) => ({
	// /user
	'/': {
		// Create new user
		POST: async (ctx) => {
			const { username, password } = await ctx.json<{
				username: string;
				password: string;
			}>();
			await userService.create({ username, password });
			return Res.json({ message: 'User created successfully' });
		},
	},
	// /user/:username/:id
	'/:username/id': {
		// get user id by username
		GET: async (ctx) => {
			const { username } = ctx.params;
			const id = await userService.getId(username);
			return Res.json({ message: 'OK!', data: id });
		},
	},
}));
