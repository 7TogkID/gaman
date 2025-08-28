import { Context } from "@gaman/common/types/index.js";

export class InterceptorException extends Error {
	public readonly statusCode: number;
	public readonly context?: Context;

	constructor(message: string, statusCode = 400, context?: Context) {
		super(message);
		this.name = 'InterceptorException';
		this.statusCode = statusCode;
		this.context = context;
	}
}
