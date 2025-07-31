import userBlock from './module/user/user.block.ts';
import blogBlock from './module/blog/blog.block.ts';
import { defineBlock } from '@gaman/core/block';
import mainRoutes from './main.routes';
import mainService from './main.service';

export default defineBlock({
	path: '/',
	routes: [mainRoutes],
	includes: [blogBlock, userBlock],
	bindings: {
		mainService: mainService,
	},
	error: () => {
		return Res.json(
			{ message: 'Error get data or create data!' },
			{ status: 500 },
		);
	},
});
