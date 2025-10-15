import { composeService } from '@gaman/core';

export const service = composeService(() => ({
	GetUser() {
		return '';
	},
}));

export type AppServiceType = ReturnType<typeof service>;
