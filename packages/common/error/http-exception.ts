import { Context } from '@gaman/common/types/types.js';

export class HttpException extends Error {
	public readonly statusCode: number;
	public readonly context?: Context;
	public readonly details?: any;
  public readonly gamanException = true;

	constructor(
		message: string,
		statusCode: number,
		context?: Context,
		details?: any,
	) {
		super(message);
		this.name = 'HttpException';
		this.statusCode = statusCode;
		this.context = context;
		this.details = details;

		// Maintain proper stack trace (only works on V8 environments like Node.js)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, HttpException);
		}
	}

	toJSON() {
		return {
			status: this.statusCode,
			message: this.message,
			details: this.details,
		};
	}
}
