/**
 * @module
 * Gaman MIME Utilities
 */
/**
 * Reference:
 * Inspired by Hono's internal mime utility.
 * https://github.com/honojs/hono/blob/main/src/utils/mime.ts
 */
export const detectMime = (fileName, types = {}) => {
    types = { ...GAMAN_MIME, ...types };
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext)
        return;
    let type = types[ext];
    if (type?.startsWith('text/')) {
        type += '; charset=utf-8';
    }
    return type;
};
export const detectExtension = (mimeType, types = {}) => {
    types = { ...GAMAN_MIME, ...types };
    for (const key in types) {
        if (types[key] === mimeType)
            return key;
    }
};
export { GAMAN_MIME };
const GAMAN_MIME = {
    aac: 'audio/aac',
    avi: 'video/x-msvideo',
    avif: 'image/avif',
    av1: 'video/av1',
    bin: 'application/octet-stream',
    bmp: 'image/bmp',
    css: 'text/css',
    csv: 'text/csv',
    eot: 'application/vnd.ms-fontobject',
    epub: 'application/epub+zip',
    gif: 'image/gif',
    gz: 'application/gzip',
    htm: 'text/html',
    html: 'text/html',
    ico: 'image/x-icon',
    ics: 'text/calendar',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'application/javascript',
    json: 'application/json',
    jsonld: 'application/ld+json',
    map: 'application/json',
    mid: 'audio/midi',
    midi: 'audio/midi',
    mjs: 'application/javascript',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    oga: 'audio/ogg',
    ogv: 'video/ogg',
    ogx: 'application/ogg',
    opus: 'audio/opus',
    otf: 'font/otf',
    pdf: 'application/pdf',
    png: 'image/png',
    rtf: 'application/rtf',
    svg: 'image/svg+xml',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    ts: 'video/mp2t',
    ttf: 'font/ttf',
    txt: 'text/plain',
    wasm: 'application/wasm',
    webm: 'video/webm',
    weba: 'audio/webm',
    webmanifest: 'application/manifest+json',
    webp: 'image/webp',
    woff: 'font/woff',
    woff2: 'font/woff2',
    xhtml: 'application/xhtml+xml',
    xml: 'application/xml',
    zip: 'application/zip',
    '3gp': 'video/3gpp',
    '3g2': 'video/3gpp2',
    gltf: 'model/gltf+json',
    glb: 'model/gltf-binary',
};
