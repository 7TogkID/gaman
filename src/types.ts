import type { WebSocket, WebSocketServer } from 'ws';
import type { HttpException } from './error/http-exception';
import { ClientRequest } from 'http';
import { GamanHeaders } from './headers';
import { FormData } from './context/formdata';
import { GamanCookies } from './context/cookies';
import { Response } from './response';
import { GamanSession } from './context/session';
import { GamanBase } from './gaman-base';
import { File } from './context/formdata/file';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type IIntegration<A extends AppConfig = AppConfig> = {
	/**
	 * The name of the integration.
	 * This property is required.
	 */
	name: string;

	/**
	 * The priority of the integration.
	 * This property is required and determines the execution order of integrations.
	 */
	priority: Priority;

	/**
	 * Callback executed when the integration is loaded.
	 * Use this to perform setup or initialization tasks.
	 */
	onLoad?: (app: GamanBase<A>) => void;

	/**
	 * Callback executed when the integration is disabled.
	 * Use this to clean up or remove configurations.
	 */
	onDisabled?: (app: GamanBase<A>) => void;

	/**
	 * Callback executed when a client makes a request to the server.
	 * This allows you to modify the context or handle specific request logic.
	 */
	onRequest?: (app: GamanBase<A>, ctx: Context<A>) => NextResponse;

	/**
	 * Callback executed before the response is sent to the client.
	 * Use this to modify or enhance the response.
	 */
	onResponse?: (app: GamanBase<A>, ctx: Context<A>, res: Response) => Promise<Response> | Response;
};

export type AppOptions<A extends AppConfig> = {
	/**
	 * must use slash '/' at the end of the path
	 * @example '/user/detail/'
	 */
	strict?: boolean;

	/**
	 * List of integrations to be used in the application.
	 * Integrations can modify app behavior or add features.
	 */
	integrations?: Array<IIntegration<A>>;

	/**
	 * List of blocks defining routes, middlewares, and other functionalities for the application.
	 */
	blocks?: Array<IBlock<A>>;

	/**
	 * Global error handler for handling application-wide errors.
	 * Called with the error and the current request context.
	 */
	error?: (error: Error, ctx: Context<A>, next: () => NextResponse) => NextResponse;

	/**
	 * Server configuration options, including host and port.
	 */
	server?: {
		/**
		 * The host address for the server.
		 * Defaults to 'localhost' if not specified.
		 *
		 * @example '127.0.0.1'
		 */
		host?: string;

		/**
		 * The port number for the server.
		 * If set to 0, a random available port will be used.
		 * Defaults to 3431 if not specified.
		 *
		 * @example 3000
		 */
		port?: number;

		/**
		 * Disable all internal server logs such as startup messages.
		 * Useful for test environments or CI pipelines.
		 *
		 * @default false
		 */
		silent?: boolean;
	};
};
export type LocalsEmpty = object;
export type EnvEmpty = object;

export type AppConfig = {
	Locals: Gaman.Locals;
	Env: Gaman.Env;
};

export type Priority = 'very-high' | 'high' | 'normal' | 'low' | 'very-low';

/* -------------------------------------------------------------------------- */
/*                                   Handler                                  */
/* -------------------------------------------------------------------------- */

export type Handler<A extends AppConfig> = (
	c: Context<A>,
	next: () => NextResponse,
) => NextResponse;
// Tipe handler untuk event-event WebSocket

export interface WebSocketContext extends WebSocket {
	server: WebSocketServer;
}
export type WebSocketServerHandler = (
	ctx: WebSocketContext,
) => Promise<WebSocketHandler> | WebSocketHandler;

export type WebSocketHandler = {
	onOpen?: () => void; // Dipanggil saat koneksi terbuka
	onClose?: (code?: number, reason?: string) => void; // Dipanggil saat koneksi ditutup
	onMessage?: (message: any) => void; // Dipanggil saat pesan diterima
	onPong?: (data: Buffer) => void; // Dipanggil saat menerima "pong"
	onError?: (error: Error) => void; // Dipanggil saat terjadi error
	onRedirect?: (url: string, request: ClientRequest) => void;
};

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
	 * An instance of GamanHeaders for easier and normalized access to request headers.
	 */
	headers: GamanHeaders;

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
	json: <T>() => Promise<T>;

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

export interface Context<A extends AppConfig = AppConfig>
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
		| 'file'
		| 'files'
	> {
	locals: A['Locals'];
	env: A['Env'];
	url: URL;
	cookies: GamanCookies;
	request: Request;
	session: GamanSession;
	response: typeof Response,
	res: typeof Response
}

export type NextResponse =
	| Promise<Response | undefined>
	| Response
	| object
	| Array<any>
	| string
	| undefined;

export interface Router<A extends AppConfig> {
	GET?: Handler<A> | Handler<A>[];
	HEAD?: Handler<A> | Handler<A>[];
	PUT?: Handler<A> | Handler<A>[];
	PATCH?: Handler<A> | Handler<A>[];
	POST?: Handler<A> | Handler<A>[];
	DELETE?: Handler<A> | Handler<A>[];

	[nestedPath: string]: Router<A> | Handler<A> | Handler<A>[] | undefined;
}

export interface RoutesDefinition<A extends AppConfig> {
	[path: string]: Router<A> | Handler<A> | Handler<A>[];
}

/* -------------------------------------------------------------------------- */
/*                                    Block                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the structure of a block in the application.
 */
export interface IBlock<A extends AppConfig> {
	/**
	 * Array of included middlewares
	 */
	includes?: Array<Handler<A>>;

	/**
	 * Array of children blocks
	 */
	childrens?: Array<IBlock<A>>;

	/**
	 * Determines the priority of the block.
	 * Higher priorities are processed earlier.
	 */
	priority?: Priority;

	/**
	 * Specifies the domain under which this block operates.
	 * If omitted, the block applies to all domains.
	 */
	domain?: string;

	/**
	 * Defines the base path for this block.
	 * All routes and WebSocket handlers within the block are scoped to this path.
	 */
	path?: string;

	/**
	 * Handler for all incoming HTTP requests to the block.
	 * This is a catch-all handler that processes all paths not explicitly defined in `routes`.
	 */
	all?: Handler<A>;

	/**
	 * Handler for HTTP requests that do not match any defined route in the block.
	 */
	notFound?: Handler<A>;

	/**
	 * Error handler for the block.
	 * This function is called when an error occurs while processing a request.
	 *
	 * @param error - The error object containing details about the error.
	 * @param ctx - The context object representing the current request.
	 * @returns A `NextResponse` to handle the error gracefully.
	 */
	error?: (error: HttpException, ctx: Context<A>, next: () => NextResponse) => NextResponse;

	/**
	 * Defines a set of routes for this block.
	 * Each route maps a path to a specific handler.
	 */
	routes?: RoutesDefinition<A>;

	/**
	 * WebSocket server handler for the block.
	 * This handles WebSocket connections scoped to the block's path.
	 */
	websocket?: WebSocketServerHandler;
}
