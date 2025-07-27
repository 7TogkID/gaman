import type { WebSocket, WebSocketServer } from "ws";
import { ClientRequest } from "http";
import { GamanHeaders } from "./headers";
import { FormData } from "./context/formdata";
import { GamanCookies } from "./context/cookies";
import { Response } from "./response";
import { GamanSession } from "./context/session";
import { File } from "./context/formdata/file";
import { Block } from "./src/block";
import { IntegrationFactory } from "./integration";

export type AppOptions<A extends AppConfig> = {
  /**
   * main block module
   */
  block?: Block<A>;

  /**
   * must use slash '/' at the end of the path
   * @example '/user/detail/'
   */
  strict?: boolean;

  /**
   * List of integrations to be used in the application.
   * Integrations can modify app behavior or add features.
   */
  integrations?: Array<IntegrationFactory<A>>;

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

export type Priority = "very-high" | "high" | "normal" | "low" | "very-low";

/* -------------------------------------------------------------------------- */
/*                                   Handler                                  */
/* -------------------------------------------------------------------------- */

export type Handler<A extends AppConfig> = (
  c: Context<A>,
  next: () => NextResponse
) => NextResponse;
// Tipe handler untuk event-event WebSocket

export interface WebSocketContext extends WebSocket {
  server: WebSocketServer;
}
export type WebSocketServerHandler = (
  ctx: WebSocketContext
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
    | "header"
    | "headers"
    | "param"
    | "params"
    | "query"
    | "text"
    | "json"
    | "formData"
    | "input"
    | "file"
    | "files"
  > {
  locals: A["Locals"];
  env: A["Env"];
  url: URL;
  cookies: GamanCookies;
  request: Request;
  session: GamanSession;
  response: typeof Response;
  res: typeof Response;
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
