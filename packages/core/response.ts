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

	/**
	 * Shorthand method to finish request with "200" status code
	 */
	static ok(body: string | object): Response {
		if (typeof body === 'string') {
			return this.text(body, { status: 200 });
		}

		return this.json(body, { status: 200 });
	}
	
	/**
	 * Shorthand method to finish request with "201" status code
	 */
	static created(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 201 });
		}

		return this.json(body, { status: 201 });
	}

	/**
	 * Shorthand method to finish request with "202" status code
	 */
	static accepted(body: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 202 });
		}

		return this.json(body, { status: 202 });
	}

	/**
	 * Shorthand method to finish request with "203" status code
	 */
	static nonAuthoritativeInformation(body: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 203 });
		}

		return this.json(body, { status: 203 });
	}

	/**
	 * Shorthand method to finish request with "204" status code
	 */
	static noContent(): Response {
		return new Response(null, { status: 204 });
	}

	/**
	 * Shorthand method to finish request with "205" status code
	 */
	static resetContent(): Response {
		return new Response(null, { status: 205 });
	}

	/**
	 * Shorthand method to finish request with "206" status code
	 */
	static partialContent(body: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 206 });
		}
		
		return this.json(body, { status: 206 });
	}

	/**
	 * Shorthand method to finish request with "400" status code
	 */
	static badRequest(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 400 });
		}

		return this.json(body, { status: 400 });
	}

	/**
	 * Shorthand method to finish request with "401" status code
	 */
	static unauthorized(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 401 });
		}

		return this.json(body, { status: 401 });
	}

	/**
	 * Shorthand method to finish request with "403" status code
	 */
	static forbidden(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 403 });
		}

		return this.json(body, { status: 403 });
	}

	/**
	 * Shorthand method to finish request with "404" status code
	 */
	static notFound(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 404 });
		}

		return this.json(body, { status: 404 });
	}

	/**
	 * Shorthand method to finish request with "500" status code
	 */
	static internalServerError(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 500 });
		}

		return this.json(body, { status: 500 });
	}

	/**
	 * Shorthand method to finish request with "503" status code
	 */
	static serviceUnavailable(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 503 });
		}

		return this.json(body, { status: 503 });
	}
}
