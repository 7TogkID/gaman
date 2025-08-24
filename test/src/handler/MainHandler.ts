import { composeHandler } from "@gaman/core/handler";

export default composeHandler(() => ({
	CreateHandler(ctx) {
		console.log("PROSES")
		return { message: 'OK!' };
	},
}));
 