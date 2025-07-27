import { defineRoutes } from '@gaman/core/routes';
import mainService from './main.service';

interface Deps {
	mainService: ReturnType<typeof mainService>;
}

export default defineRoutes(({ mainService }: Deps) => ({
	'/': (ctx) => {
		ctx.locals.example
		return r.json({ message: mainService.getMessage() });
	},
}));
