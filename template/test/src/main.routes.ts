import { defineRoutes } from '@gaman/core/routes';
import mainService from 'main.service';
import tesService from 'tes.service';

interface Deps {
	mainService: ReturnType<typeof mainService>;
  tesService: ReturnType<typeof tesService>;
}

export default defineRoutes(({ mainService, tesService }: Deps) => ({
	'/': () => {
		return mainService.getMessage();
	},
}));
