export enum HttpMethods {
	GET,
	POST,
	PUT,
	DELETE,
	PATCH,
	ALL,
	OPTIONS,
	HEAD,
}

export type HttpMethod = keyof typeof HttpMethods;
