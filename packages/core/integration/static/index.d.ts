import { Priority } from "../../types";
export interface StaticFileOptions {
    path?: string;
    mimes?: Record<string, string>;
    priority?: Priority;
    defaultDocument?: string;
    rewriteRequestPath?: (path: string) => string;
    onFound?: (path: string, ctx: any) => void | Promise<void>;
    onNotFound?: (path: string, ctx: any) => void | Promise<void>;
    cacheControl?: string;
    fallbackToIndexHTML?: boolean;
}
/**
 * Serve static files for your GamanJS app.
 *
 * This middleware allows you to serve static assets like images, JavaScript, CSS,
 * or even entire HTML pages from a specific folder (default: `public/`).
 *
 * It includes automatic detection for:
 * - MIME types (customizable via `mimes`)
 * - Brotli (.br) and Gzip (.gz) compression based on `Accept-Encoding`
 * - ETag generation for efficient caching (supports 304 Not Modified)
 *
 * ## Options
 * - `path`: Root directory of static assets. Default is `public`.
 * - `mimes`: Custom MIME types. You can map file extensions manually.
 * - `priority`: Determines execution order. Use `'very-high'` if you want static to run early.
 * - `defaultDocument`: Filename to serve when a directory is requested (default: `index.html`).
 * - `rewriteRequestPath`: A function to rewrite request paths (e.g., strip `/static` prefix).
 * - `onFound`: Optional callback when a static file is found and served.
 * - `onNotFound`: Optional callback when no file is found at the requested path.
 * - `cacheControl`: Customize `Cache-Control` header. Default is 1 hour.
 * - `fallbackToIndexHTML`: If true, fallback to `index.html` for unmatched routes (SPA support).
 *
 * ## Example
 * ```ts
 * gamanStatic({
 *   path: 'assets',
 *   rewriteRequestPath: (p) => p.replace(/^\/static/, ''),
 *   fallbackToIndexHTML: true,
 *   mimes: {
 *     '.webmanifest': 'application/manifest+json'
 *   }
 * })
 * ```
 */
export declare function gamanStatic(options?: StaticFileOptions): import("..").IntegrationFactory<import("../../types").AppConfig>;
