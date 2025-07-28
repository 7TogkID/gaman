import { defineService } from '@gaman/core/service';

interface Deps {
	// place your dependencies or other services
}

export default defineService(({}: Deps) => ({
	getMessage: () => 'Tes Service',
}));