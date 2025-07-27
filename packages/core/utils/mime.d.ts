/**
 * @module
 * Gaman MIME Utilities
 */
/**
 * Reference:
 * Inspired by Hono's internal mime utility.
 * https://github.com/honojs/hono/blob/main/src/utils/mime.ts
 */
export declare const detectMime: (fileName: string, types?: Record<string, string>) => string | undefined;
export declare const detectExtension: (mimeType: string, types?: Record<string, string>) => string | undefined;
export { GAMAN_MIME };
declare const GAMAN_MIME: Record<string, string>;
