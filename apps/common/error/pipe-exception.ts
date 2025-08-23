export class PipeException extends Error {
	public readonly statusCode: number;
	public readonly context?: any;

	constructor(message: string, statusCode = 400, context?: any) {
		super(message);
		this.name = 'PipeException';
		this.statusCode = statusCode;
		this.context = context;
	}
}
