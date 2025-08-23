import { composeHandler } from "@gaman/core/handler";

export default composeHandler(() => ({
	CreateHandler(ctx) {
		return { message: 'OK!' };
	},
}));
