export type ExceptionHandler = (error: Error) => any;

export function composeExceptionHandler(
	cb: ExceptionHandler,
): ExceptionHandler {
	return cb;
}
