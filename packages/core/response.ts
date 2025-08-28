import { GamanHeader } from '@gaman/core/headers/index.js';

export class ViewResponse {
	private viewName: string;
	private viewData: Record<string, any>;
	private init: IResponseOptions;

	constructor(
		viewName: string,
		viewData: Record<string, any> = {},
		init: IResponseOptions = { status: 200 },
	) {
		this.viewName = viewName;
		this.viewData = viewData;
		this.init = init;
	}

	getName() {
		return this.viewName;
	}

	getData() {
		return this.viewData;
	}

	getOptions() {
		return this.init;
	}
}


export interface IResponseOptions {
	status?: number;
	statusText?: string;
	headers?: Record<string, string | string[]>;
}

export class Response {
	public view?: ViewResponse;
	public headers: GamanHeader;
	public status: number;
	public statusText: string;
	public body?: any;
	constructor(
		body?: any,
		options: IResponseOptions = {},
	) {
		this.body = body;
		this.headers = new GamanHeader(options.headers || {});
		this.status = options.status || 200;
		this.statusText = options.statusText || '';
	}

	static json(data: any, init: IResponseOptions = {}): Response {
		return new Response(JSON.stringify(data, null, 2), {
			...init,
			headers: {
				'Content-Type': 'application/json',
				...(init.headers || {}),
			},
		});
	}

	static text(message: string, init: IResponseOptions = {}): Response {
		return new Response(message, {
			...init,
			headers: {
				'Content-Type': 'text/plain',
				...(init.headers || {}),
			},
		});
	}

	static html(body: string, init: IResponseOptions = {}): Response {
		return new Response(body, {
			...init,
			headers: {
				'Content-Type': 'text/html',
				...(init.headers || {}),
			},
		});
	}

	static render(
		viewName: string,
		viewData: Record<string, any> = {},
		init: IResponseOptions = { status: 200 },
	): Response {
		const res = new Response(null, {
			...init,
			headers: {
				'Content-Type': 'text/html',
				...(init.headers || {}),
			},
		});
		res.view =  new ViewResponse(viewName, viewData, init);
		return res;
	}

	static stream(readableStream: NodeJS.ReadableStream, init: IResponseOptions = {}): Response {
		return new Response(readableStream, {
			...init,
			headers: {
				'Content-Type': 'application/octet-stream',
				...(init.headers || {}),
			},
		});
	}

	static redirect(location: string, statusNumber: number = 302): Response {
		return new Response(null, {
			status: statusNumber,
			headers: {
				Location: location,
			},
		});
	}
}
