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
	constructor(body?: any, options: IResponseOptions = {}) {
		this.body = body;
		this.headers = new GamanHeader(options.headers || {});
		this.status = options.status || 200;
		this.statusText = options.statusText || '';
	}

	static json(data: any, init: IResponseOptions | number = {}): Response {
		const ops: IResponseOptions =
			typeof init === 'number' ? { status: init } : init;

		return new Response(JSON.stringify(data, null, 2), {
			...ops,
			headers: {
				'Content-Type': 'application/json',
				...(ops.headers || {}),
			},
		});
	}

	static text(message: string, init: IResponseOptions | number = {}): Response {
		const ops: IResponseOptions =
			typeof init === 'number' ? { status: init } : init;

		return new Response(message, {
			...ops,
			headers: {
				'Content-Type': 'text/plain',
				...(ops.headers || {}),
			},
		});
	}

	static html(body: string, init: IResponseOptions | number = {}): Response {
		const ops: IResponseOptions =
			typeof init === 'number' ? { status: init } : init;

		return new Response(body, {
			...ops,
			headers: {
				'Content-Type': 'text/html',
				...(ops.headers || {}),
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
		res.view = new ViewResponse(viewName, viewData, init);
		return res;
	}

	static stream(
		readableStream: NodeJS.ReadableStream,
		init: IResponseOptions | number = {},
	): Response {
		const ops: IResponseOptions =
			typeof init === 'number' ? { status: init } : init;

		return new Response(readableStream, {
			...ops,
			headers: {
				'Content-Type': 'application/octet-stream',
				...(ops.headers || {}),
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
	 * Shorthand method to finish request with "300" status code
	 */
	static multipleChoices(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 300 });
		}

		return this.json(body, { status: 300 });
	}

	/**
	 * Shorthand method to finish request with "301" status code
	 */
	static movedPermanently(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 301 });
		}

		return this.json(body, { status: 301 });
	}

	/**
	 * Shorthand method to finish request with "302" status code
	 */
	static movedTemporarily(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 302 });
		}

		return this.json(body, { status: 302 });
	}

	/**
	 * Shorthand method to finish request with "303" status code
	 */
	static seeOther(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 303 });
		}

		return this.json(body, { status: 303 });
	}

	/**
	 * Shorthand method to finish request with "304" status code
	 */
	static notModified(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 304 });
		}

		return this.json(body, { status: 304 });
	}

	/**
	 * Shorthand method to finish request with "305" status code
	 */
	static useProxy(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 305 });
		}

		return this.json(body, { status: 305 });
	}

	/**
	 * Shorthand method to finish request with "307" status code
	 */
	static temporaryRedirect(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 307 });
		}

		return this.json(body, { status: 307 });
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
	 * Shorthand method to finish request with "402" status code
	 */
	static paymentRequired(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 402 });
		}

		return this.json(body, { status: 402 });
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
	 * Shorthand method to finish request with "405" status code
	 */
	static methodNotAllowed(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 405 });
		}

		return this.json(body, { status: 405 });
	}

	/**
	 * Shorthand method to finish request with "406" status code
	 */
	static notAcceptable(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 406 });
		}

		return this.json(body, { status: 406 });
	}

	/**
	 * Shorthand method to finish request with "407" status code
	 */
	static proxyAuthenticationRequired(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 407 });
		}

		return this.json(body, { status: 407 });
	}

	/**
	 * Shorthand method to finish request with "408" status code
	 */
	static requestTimeout(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 408 });
		}

		return this.json(body, { status: 408 });
	}

	/**
	 * Shorthand method to finish request with "409" status code
	 */
	static conflict(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 409 });
		}

		return this.json(body, { status: 409 });
	}

	/**
	 * Shorthand method to finish request with "410" status code
	 */
	static gone(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 410 });
		}

		return this.json(body, { status: 410 });
	}

	/**
	 * Shorthand method to finish request with "411" status code
	 */
	static lengthRequired(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 411 });
		}

		return this.json(body, { status: 411 });
	}

	/**
	 * Shorthand method to finish request with "412" status code
	 */
	static preconditionFailed(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 412 });
		}

		return this.json(body, { status: 412 });
	}

	/**
	 * Shorthand method to finish request with "413" status code
	 */
	static requestEntityTooLarge(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 413 });
		}

		return this.json(body, { status: 413 });
	}

	/**
	 * Shorthand method to finish request with "414" status code
	 */
	static requestUriTooLong(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 414 });
		}

		return this.json(body, { status: 414 });
	}

	/**
	 * Shorthand method to finish request with "415" status code
	 */
	static unsupportedMediaType(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 415 });
		}

		return this.json(body, { status: 415 });
	}

	/**
	 * Shorthand method to finish request with "416" status code
	 */
	static requestedRangeNotSatisfiable(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 416 });
		}

		return this.json(body, { status: 416 });
	}

	/**
	 * Shorthand method to finish request with "417" status code
	 */
	static expectationFailed(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 417 });
		}

		return this.json(body, { status: 417 });
	}

	/**
	 * Shorthand method to finish request with "422" status code
	 */
	static unprocessableEntity(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 422 });
		}

		return this.json(body, { status: 422 });
	}

	/**
	 * Shorthand method to finish request with "429" status code
	 */
	static tooManyRequests(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 429 });
		}

		return this.json(body, { status: 429 });
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
	 * Shorthand method to finish request with "501" status code
	 */
	static notImplemented(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 501 });
		}

		return this.json(body, { status: 501 });
	}

	/**
	 * Shorthand method to finish request with "502" status code
	 */
	static badGateway(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 502 });
		}

		return this.json(body, { status: 502 });
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

	/**
	 * Shorthand method to finish request with "504" status code
	 */
	static gatewayTimeout(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 504 });
		}

		return this.json(body, { status: 504 });
	}

	/**
	 * Shorthand method to finish request with "505" status code
	 */
	static httpVersionNotSupported(body?: string | object): Response {
		if (typeof body === 'string') {
			return this.html(body, { status: 505 });
		}

		return this.json(body, { status: 505 });
	}
}
