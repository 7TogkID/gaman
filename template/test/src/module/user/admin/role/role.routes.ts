import { defineRoutes } from "@gaman/core/routes";

interface Deps {
	// place your dependencies or services
}

export default defineRoutes(({}: Deps) => ({
	'/': () => {
		return 'Hello, World!';
	},
}));
