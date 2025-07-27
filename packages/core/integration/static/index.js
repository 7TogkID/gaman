"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamanStatic = gamanStatic;
const fs_1 = require("fs");
const path_1 = require("path");
const __1 = require("..");
const response_1 = require("../../response");
const logger_1 = require("../../utils/logger");
const crypto = require("crypto");
const mime_1 = require("../../utils/mime");
// Buat ETag dari ukuran dan waktu modifikasi file
function generateETag(stat) {
    const tag = `${stat.size}-${stat.mtime.getTime()}`;
    return `"${crypto.createHash("sha1").update(tag).digest("hex")}"`;
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
function gamanStatic(options = {}) {
    const staticPath = options.path || "public";
    const defaultDocument = options.defaultDocument ?? "index.html";
    const cacheControl = options.cacheControl ?? "public, max-age=3600";
    return (0, __1.defineIntegration)(() => ({
        name: "static",
        priority: options.priority || "very-high",
        async onRequest(ctx) {
            logger_1.Log.setRoute("");
            logger_1.Log.setMethod("");
            logger_1.Log.setStatus(null);
            let reqPath = ctx.request.pathname;
            // Rewriting path jika disediakan
            if (options.rewriteRequestPath) {
                reqPath = options.rewriteRequestPath(reqPath);
            }
            let filePath = (0, path_1.join)(process.cwd(), staticPath, reqPath);
            let stats;
            // Cari file (jika direktori, cari defaultDocument)
            try {
                stats = await fs_1.promises.stat(filePath);
                if (stats.isDirectory()) {
                    filePath = (0, path_1.join)(filePath, defaultDocument);
                    stats = await fs_1.promises.stat(filePath);
                }
            }
            catch {
                // Fallback ke index.html untuk SPA
                if (options.fallbackToIndexHTML) {
                    try {
                        filePath = (0, path_1.join)(process.cwd(), staticPath, "index.html");
                        stats = await fs_1.promises.stat(filePath);
                    }
                    catch {
                        await options.onNotFound?.(filePath, ctx);
                        return next();
                    }
                }
                else {
                    await options.onNotFound?.(filePath, ctx);
                    return next();
                }
            }
            if (!stats.isFile())
                return next();
            // Gzip/Brotli: cek Accept-Encoding dan cari file terkompresi
            const acceptEncoding = ctx.request.headers.get("accept-encoding") || "";
            let encoding = null;
            let encodedFilePath = filePath;
            if (acceptEncoding.includes("br")) {
                try {
                    await fs_1.promises.access(`${filePath}.br`);
                    encoding = "br";
                    encodedFilePath = `${filePath}.br`;
                }
                catch { }
            }
            else if (acceptEncoding.includes("gzip")) {
                try {
                    await fs_1.promises.access(`${filePath}.gz`);
                    encoding = "gzip";
                    encodedFilePath = `${filePath}.gz`;
                }
                catch { }
            }
            // Buat ETag dan handle conditional GET
            const etag = generateETag((0, fs_1.statSync)(encodedFilePath));
            if (ctx.request.headers.get("if-none-match") === etag) {
                return response_1.Response.text("", { status: 304 });
            }
            // Cari MIME type dari ekstensi
            const contentType = (0, mime_1.detectMime)(filePath, options.mimes) || "application/octet-stream";
            // Callback saat ditemukan
            await options.onFound?.(encodedFilePath, ctx);
            // Kirim file
            return response_1.Response.stream((0, fs_1.createReadStream)(encodedFilePath), {
                status: 200,
                headers: {
                    "Content-Type": contentType,
                    ...(encoding ? { "Content-Encoding": encoding } : {}),
                    Vary: "Accept-Encoding",
                    ETag: etag,
                    "Cache-Control": cacheControl,
                },
            });
        },
    }));
}
