import { defineService } from '@gaman/core/service';
import tesService from 'tes.service';

interface Deps {
	tesService: ReturnType<typeof tesService>;
}

export default defineService(({ tesService }: Deps) => ({
	getMessage: () => tesService.getMessage(),
}));
