import { ExceptionHandler } from '@gaman/core/index.js';

const exceptions: Array<ExceptionHandler> = [];

function register(...interceptor: ExceptionHandler[]) {
	exceptions.push(...interceptor);
}
function getExceptionHandlers(): ExceptionHandler[] {
	return exceptions;
}

export default {
	register,
	getExceptionHandlers,
};
