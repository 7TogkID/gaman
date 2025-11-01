import { createReadStream, promises as fsPromises, Stats, statSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { detectMime, getGamanConfig, Log, Priority } from '@gaman/common';
import { composeMiddleware, Response } from '@gaman/core';

export interface StaticFileOptions {
  mimes?: Record<string, string>;
  defaultDocument?: string;
  rewriteRequestPath?: (path: string) => string;
  onFound?: (filePath: string, ctx: any) => void | Promise<void>;
  onNotFound?: (filePath: string, ctx: any) => void | Promise<void>;
  cacheControl?: string;
  fallbackToIndexHTML?: boolean;
  priority?: Priority;
  includes?: string[];
  excludes?: string[];
}

// Buat ETag dari ukuran dan waktu modifikasi file
function generateETag(stat: { size: number; mtime: Date }) {
  const tag = `${stat.size}-${stat.mtime.getTime()}`;
  return `"${crypto.createHash('sha1').update(tag).digest('hex')}"`;
}

export function staticServe(options: StaticFileOptions = {}) {
  let staticPath: string;
  const defaultDocument = options.defaultDocument ?? 'index.html';
  const cacheControl = options.cacheControl ?? 'public, max-age=3600';

  const middleware = composeMiddleware(async (ctx, next) => {
    let reqPath = ctx.request.pathname;

    if (options.rewriteRequestPath) {
      reqPath = options.rewriteRequestPath(reqPath);
    }

    const config = await getGamanConfig();
    staticPath = join(config.build?.outdir || 'dist', 'client');
    const publicPath = config.build?.staticdir || 'public';

    let filePath = join(process.cwd(), staticPath, reqPath);
    let stats: Stats;

    // Cek file & fallback ke defaultDocument
    async function tryResolve(base: string) {
      let target = join(process.cwd(), base, reqPath);
      try {
        let s = await fsPromises.stat(target);
        if (s.isDirectory()) {
          target = join(target, defaultDocument);
          s = await fsPromises.stat(target);
        }
        return { file: target, stats: s };
      } catch {
        return null;
      }
    }

    let resolved = await tryResolve(staticPath) ?? await tryResolve(publicPath);

    if (!resolved) {
      if (options.fallbackToIndexHTML) {
        filePath = join(process.cwd(), staticPath, 'index.html');
        stats = await fsPromises.stat(filePath);
      } else {
        await options.onNotFound?.(filePath, ctx);
        return next();
      }
    } else {
      filePath = resolved.file;
      stats = resolved.stats;
    }

    if (!stats.isFile()) return next();

    Log.setRoute('');
    Log.setMethod('');
    Log.setStatus(null);

    // Gzip / Brotli
    const acceptEncoding = ctx.request.header('accept-encoding') || '';
    let encoding: 'br' | 'gzip' | null = null;
    let encodedFilePath = filePath;

    if (acceptEncoding.includes('br')) {
      try {
        await fsPromises.access(`${filePath}.br`);
        encoding = 'br';
        encodedFilePath = `${filePath}.br`;
      } catch {}
    } else if (acceptEncoding.includes('gzip')) {
      try {
        await fsPromises.access(`${filePath}.gz`);
        encoding = 'gzip';
        encodedFilePath = `${filePath}.gz`;
      } catch {}
    }

    const statForEtag = statSync(encodedFilePath);
    const etag = generateETag(statForEtag);
    if (ctx.request.header('if-none-match') === etag) {
      return Response.notModified();
    }

    const contentType = detectMime(filePath, options.mimes) || 'application/octet-stream';
    await options.onFound?.(encodedFilePath, ctx);

    return Response.stream(createReadStream(encodedFilePath), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        ...(encoding ? { 'Content-Encoding': encoding } : {}),
        Vary: 'Accept-Encoding',
        ETag: etag,
        'Cache-Control': cacheControl,
      },
    });
  });

  return middleware({
    priority: options.priority ?? Priority.MONITOR,
    includes: options.includes,
    excludes: options.excludes,
  });
}
