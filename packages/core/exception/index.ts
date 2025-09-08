import { IS_EXCEPTION_HANDLER } from '@gaman/common/contants.js';
import { registerExceptions } from '@gaman/core/registry.js';

export type ExceptionHandler = (error: Error) => any;

export function autoComposeExceptionHandler(
	cb: ExceptionHandler,
): ExceptionHandler {
	const handler = composeExceptionHandler(cb);
	registerExceptions(handler);
	return handler;
}

export function composeExceptionHandler(
	cb: ExceptionHandler,
): ExceptionHandler {
	Object.defineProperty(cb, IS_EXCEPTION_HANDLER, {
		value: true,
		writable: false,
		enumerable: false,
	});
	return cb;
}
