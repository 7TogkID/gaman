/**
 * @module
 * CORS Middleware for Gaman.
 * Implements Cross-Origin Resource Sharing (CORS) with customizable options.
 */
/**
 * CORS middleware options.
 */
export type CorsOptions = {
    /** Allowed origin(s) for the request. */
    origin?: string | string[] | null;
    /** HTTP methods allowed for the request. Default: `["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"]` */
    allowMethods?: string[];
    /** Headers allowed in the request. Default: `["Content-Type", "Authorization"]` */
    allowHeaders?: string[];
    /** Maximum cache age for preflight requests (in seconds). */
    maxAge?: number;
    /** Whether to include credentials (cookies, HTTP auth, etc.) in the request. */
    credentials?: boolean;
    /** Headers exposed to the client in the response. */
    exposeHeaders?: string[];
};
/**
 * Middleware for handling Cross-Origin Resource Sharing (CORS).
 * @param options - The options for configuring CORS behavior.
 * @returns Middleware function for handling CORS.
 */
export declare const cors: (options: CorsOptions) => (customConfig?: any) => import("@gaman/common/types/middleware.types.js").MiddlewareHandler;
