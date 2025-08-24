import { GamanHeader } from '@gaman/core/headers';
import { FormData } from '@gaman/core/context/formdata';
import { GamanCookies } from '@gaman/core/context/cookies';
import { Response } from '@gaman/core/response';
import { File } from '@gaman/core/context/formdata/file';
/* -------------------------------------------------------------------------- */
/*                                   Handler                                  */
/* -------------------------------------------------------------------------- */

export type RequestHandler = (c: Context) => NextResponse;

/* -------------------------------------------------------------------------- */
/*                                   Router                                   */
/* -------------------------------------------------------------------------- */

export type QueryValue = string | number | string[];
export type Query = ((name: string) => QueryValue) & Record<string, QueryValue>;

/**
 * Represents an HTTP request in the GamanJS framework.
 */
export interface Request {
	/**
	 * HTTP method (e.g., GET, POST, PUT, DELETE).
	 */
	method: string;

	/**
	 * Full request URL including query string and host (e.g., "http://localhost/home?search=test").
	 */
	url: string;

	/**
	 * Pathname portion of the URL (e.g., "/home/user"), excludes query string and host.
	 */
	pathname: string;

	/**
	 * An instance of GamanHeader for easier and normalized access to request headers.
	 */
	headers: GamanHeader;

	/**
	 * Get the value of a specific header (case-insensitive).
	 *
	 * @param key - The header name (e.g., "Content-Type")
	 *
	 * @returns The value of the specified header or undefined if not present.
	 */
	header: (key: string) => string | undefined;

	/**
	 * Get a single route parameter by name.
	 *
	 * For example, in route "/user/:id", `param("id")` would return the dynamic value.
	 *
	 * @param name - The name of the route parameter.
	 */
	param: (name: string) => any;

	/**
	 * All route parameters extracted from the dynamic route.
	 *
	 * For example, "/post/:postId/comment/:commentId" => { postId: "123", commentId: "456" }
	 */
	params: Record<string, any>;

	/**
	 * Query parameters parsed from the URL.
	 *
	 * For example, "/search?q=test&page=2" => { q: "test", page: "2" }
	 */
	query: Query;

	/**
	 * Returns the raw request body as a Buffer.
	 *
	 * Useful for binary uploads or low-level processing.
	 */
	body: () => Promise<Buffer<ArrayBufferLike>>;

	/**
	 * Reads the request body as plain text.
	 *
	 * Suitable for `Content-Type: text/plain`.
	 */
	text: () => Promise<string>;

	/**
	 * Parses the request body as JSON.
	 *
	 * Suitable for
	 * - `Content-Type: application/json`
	 * - `Content-Type: application/x-www-form-urlencoded`.
	 *
	 * @returns A typed JSON object.
	 */
	json: <T = any>() => Promise<T>;

	/**
	 * Parses the request body as FormData.
	 *
	 * Supports `multipart/form-data` and `application/x-www-form-urlencoded`.
	 */
	formData: () => Promise<FormData>;

	/**
	 * Gets a single string value from form data by name.
	 *
	 * Equivalent to `formData().get(name).asString()`.
	 * @param name - The form field name.
	 */
	input: (name: string) => Promise<string | undefined>;

	/**
	 * Gets a many string values from form data by name.
	 *
	 * Equivalent to `formData().getAll(name).map(asString)`
	 * @param name - The form field name
	 */
	inputs: (name: string) => Promise<Array<string>>;

	/**
	 * Gets a single file value from form data by name
	 *
	 * Equivalent to `formData().get(name).asFile()`
	 * @param name - The form field name
	 */
	file: (name: string) => Promise<File | undefined>;

	/**
	 * Gets a many file values from form data by name
	 *
	 * Equivalent to `formData().get(name).asFile()`
	 * @param name - The form field name
	 */
	files: (name: string) => Promise<Array<File | undefined>>;

	/**
	 * The client's IP address.
	 * Useful for logging, rate limiting, or geo-location.
	 */
	ip: string;
}

export interface Context
	extends Pick<
			Request,
			| 'header'
			| 'headers'
			| 'param'
			| 'params'
			| 'query'
			| 'text'
			| 'json'
			| 'formData'
			| 'input'
			| 'inputs'
			| 'file'
			| 'files'
		>,
		Gaman.Context {
	locals: Gaman.Locals;
	env: Gaman.Env;
	url: URL;
	cookies: GamanCookies;
	request: Request;
	set(k: string, v: any): void;
	get<T = any>(k: string): T;
	has(k: string): boolean;
}

export type NextResponse =
	| Promise<Response | undefined>
	| Response
	| object
	| Array<any>
	| string
	| undefined;
