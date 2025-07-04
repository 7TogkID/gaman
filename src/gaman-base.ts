import type {
  BlockInterface,
  Context,
  AppConfig,
  NextResponse,
  RoutesDefinition,
  AppOptions,
  IntegrationInterface,
} from "./types";
import http from "node:http";
import { Log } from "./utils/logger";
import { createContext } from "./context";
import { formatPath, isHtmlString } from "./utils/utils";
import { RenderResponse, Response } from "./response";
import { sortArrayByPriority } from "./utils/priority";
import { performance } from "perf_hooks";
import { Color } from "./utils/color";
import HttpError from "./error/HttpError";
import { GamanWebSocket } from "./web-socket";
import { Readable } from "node:stream";

export class GamanBase<A extends AppConfig> {
  private blocks: BlockInterface<A>[] = [];
  private websocket: GamanWebSocket<A>;
  private integrations: Array<IntegrationInterface<A>> = [];

  constructor(private options: AppOptions<A>) {
    this.websocket = new GamanWebSocket(this);

    // Initialize integrations
    if (options.integrations) {
      for (const integration of options.integrations) {
        this.integrations.push(integration);
        integration.onLoad?.(this.options);
      }
    }

    // Initialize blocks
    if (options.blocks) {
      for (const block of options.blocks) {
        if (this.blocks.some((b) => b.path === block.path)) {
          throw new Error(`Block '${block.path}' already exists!`);
        }
        if (block.websocket) {
          this.websocket.registerWebSocketServer(block);
        }
        this.blocks.push({
          ...block,
          path: block.path || "/",
        });
      }
    }
  }

  getBlock(blockPath: string): BlockInterface<A> | undefined {
    const path = formatPath(blockPath);
    const block: BlockInterface<A> | undefined = this.blocks.find(
      (b) => formatPath(b.path || "/") === path
    );
    return block;
  }

  private async requestHandle(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    Log.setRoute(req.url || "/");
    const startTime = performance.now();
    const ctx = await createContext<A>(req);
    try {
      const blocksAndIntegrations = sortArrayByPriority<
        BlockInterface<A> | IntegrationInterface<A>
      >(
        [...this.blocks, ...this.integrations],
        "priority",
        "asc" //  1, 2, 3, 4, 5 // kalau desc: 5, 4, 3, 2, 1
      );
      for await (const blockOrIntegration of blocksAndIntegrations) {
        if ("routes" in blockOrIntegration) {
          const block = blockOrIntegration as BlockInterface<A>;
          try {
            /**
             * * Jika path depannya aja udah gak sama berarti gausah di lanjutin :V
             */

            if (!(block.path && ctx.pathname.startsWith(block.path))) {
              continue;
            }

            if (block.includes) {
              for (const middleware of block.includes) {
                const result = await middleware(ctx);

                /**
                 * ? Kenapa harus di kurung di if(result){...} ???
                 * * Karena di bawahnya masih ada yang harus di proses seperti routes...
                 * * Kalau tidak di kurung maka, dia bakal jalanin middleware doang routesnya ga ke proses
                 */
                if (result) {
                  return await this.handleResponse(result, ctx, res);
                }
              }
            }

            // Global middleware handler
            if (block.all) {
              const result = await block.all(ctx);

              /**
               * ? Kenapa harus di kurung di if(result){...} ???
               * * Karena di bawahnya masih ada yang harus di proses seperti routes...
               * * Kalau tidak di kurung maka, dia bakal jalanin middleware doang routesnya ga ke proses
               */
              if (result) {
                // * Set Status Log
                return await this.handleResponse(result, ctx, res);
              }
            }

            // Process routes
            const result = await this.handleRoutes(
              block.routes || {},
              ctx,
              block.path
            );

            /**
             * * Disini gausah di kurung seperti di block.all() tadi
             * * Karna disini adalah respon akhir dari handle routes!
             */
            if (result) {
              return await this.handleResponse(result, ctx, res);
            }
          } catch (error: any) {
            if (block.error) {
              // ! Block Error handler
              const result = await block.error(
                new HttpError(403, error.message),
                ctx
              );
              if (result) {
                return await this.handleResponse(result, ctx, res);
              }
            }
            Log.error(error);
            throw new HttpError(403, error.message);
          }
        } else if ("onRequest" in blockOrIntegration) {
          const integration = blockOrIntegration as IntegrationInterface<A>;
          const result = await integration.onRequest?.(this.options, ctx);
          if (result) {
            return await this.handleResponse(result, ctx, res);
          }
        }
      }

      // not found
      return await this.handleResponse(undefined, ctx, res);
    } catch (error: any) {
      // ! Handler Error keseluruhan system

      if (this.options.error) {
        const result = await this.options.error(error, ctx);
        if (result) {
          return await this.handleResponse(result, ctx, res);
        }
      }
      Log.error(error.message);
      res.statusCode = 500;
      res.end("Internal Server Error");
    } finally {
      const endTime = performance.now();
      Log.log(
        `Request processed in ${Color.fg.green}(${(endTime - startTime).toFixed(
          1
        )}ms)${Color.reset}`
      );
      Log.setRoute("");
      Log.setStatus(null);
    }
  }

  private async handleRoutes(
    routes: RoutesDefinition<A>,
    ctx: Context<A>,
    basePath: string = "/"
  ): Promise<NextResponse<A>> {
    for await (const [path, handler] of Object.entries(routes)) {
      // * format path biar bisa nested path
      const fullPath = formatPath(`${basePath}/${path}`);

      // * setiap request di createParamRegex nya dari path Server
      const regexParam = this.createParamRegex(fullPath);

      // ? apakah path dari client dan path server itu valid?
      const match = regexParam.regex.exec(ctx.pathname);

      /**
       * * Jika match param itu tidak null
       * * berarti di ctx.params[key] add param yang ada
       */
      regexParam.keys.forEach((key, index) => {
        ctx.params[key] = match?.[index + 1] || "";
      });

      // * Jika ada BINTANG (*) berarti middleware
      let isMiddleware = fullPath.includes("*");

      /**
       * * Jika dia middleware maka pake fungsi check middleware
       * * Jika dia bukan middleware maka pake match
       */
      const isValid = isMiddleware
        ? this.checkMiddleware(fullPath, ctx.pathname)
        : match !== null;

      /**
       * * validasi (match) itu dari params
       */
      if (Array.isArray(handler) && isValid) {
        /**
         * * jalanin handler jika ($handler) adalah type Array<Handler> dan pathMatch valid
         */
        for await (const handle of handler) {
          const result = await handle(ctx);
          if (result) return result; // Lanjut handler lain jika tidak ada respon
        }
      } else if (typeof handler === "function" && isValid) {
        /**
         * * jalanin handler jika ($handler) adalah type Handler dan pathMatch valid
         */
        const result = await handler(ctx);
        if (result) return result; // Lanjut handler lain jika tidak ada respon
      } else if (typeof handler === "object") {
        for await (const [methodOrPathNested, nestedHandler] of Object.entries(
          handler
        )) {
          /**
           * * Jika dia bukan method berarti dia berupa nestedPath
           */
          if (this.isHttpMethod(methodOrPathNested)) {
            /**
             * * validasi (match) itu dari params
             */
            if (Array.isArray(nestedHandler) && isValid) {
              for await (const handle of nestedHandler) {
                const result = await handle(ctx);
                if (result) return result;
              }
            } else if (typeof nestedHandler === "function" && isValid) {
              const result = await nestedHandler(ctx);
              if (result) return result;
            }
          } else {
            // * Lakukan Proses Nested jika ada pathNested
            const result = await this.handleRoutes(
              { [methodOrPathNested]: nestedHandler },
              ctx,
              fullPath
            );

            /**
             * * Kalau kalau dia ada result langsung response
             * * Kalau gak ada lanjut ke route berikutnya...
             */
            if (result) return result;
          }
        }
      }
    }
  }

  private async handleResponse(
    result:
      | string
      | object
      | any[]
      | Promise<Response<A> | RenderResponse<A>>
      | Response<A>
      | RenderResponse<A>,
    ctx: Context<A>,
    res: http.ServerResponse
  ) {
    if (res.finished) return;

    if (this.integrations) {
      const integrations = sortArrayByPriority<IntegrationInterface<A>>(
        this.integrations,
        "priority",
        "asc"
      );

      for (const integration of integrations) {
        let _result;
        if (
          typeof result === "object" &&
          "viewName" in result &&
          integration.onRender
        ) {
          _result = await integration.onRender(this.options, ctx, result);
        } else if (integration.onResponse) {
          _result = await integration.onResponse(this.options, ctx, result);
        }

        if (_result) {
          result = _result;
          break;
        }
      }
    }

    const headers = {
      ...(result instanceof Response ? result.headers || {} : {}),
      ...ctx.headers.__getSetterData(),
    };

    if (result instanceof Response) {
      const r = new Response(result.body, {
        headers,
        context: ctx,
      });

      Log.setStatus(r.status);

      if (result.body instanceof Readable) {
        // Streaming response
        res.writeHead(result.status, result.statusText, result.headers);
        return result.body.pipe(res);
      }

      // Normal response
      res.writeHead(r.status, r.statusText, r.headers);
      return res.end(r.body);
    }

    let r: Response<A> | undefined;

    if (typeof result === "string") {
      if (isHtmlString(result)) {
        r = Response.html(result, { status: 200, context: ctx, headers });
      } else {
        r = Response.text(result, { status: 200, context: ctx, headers });
      }
    } else if (result) {
      r = Response.json(result, { status: 200, context: ctx, headers });
    }

    Log.setStatus(r?.status || 404);
    res.writeHead(r?.status || 404, r?.statusText || "", r?.headers || {});
    return res.end(r?.body || "404 Not Found");
  }

  listen() {
    const server = http.createServer(this.requestHandle.bind(this));

    server.on("upgrade", (request, socket, head) => {
      const urlString = request.url || "/";
      const { pathname } = new URL(urlString, `http://${request.headers.host}`);

      const wss = this.websocket.getWebSocketServer(pathname);
      if (wss) {
        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    const port = this.options?.server?.port || 3431;
    const host = this.options?.server?.host || "localhost";
    server.listen(port, host, () => {
      Log.log(`Server is running at http://${host}:${port}`);
    });
  }

  /**
   * Checks if a string is a valid HTTP method
   * @param method - String to check
   * @returns True if the string is a valid HTTP method
   */
  private isHttpMethod(method: string): boolean {
    return ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "ALL"].includes(
      method.toUpperCase()
    );
  }

  private createParamRegex(path: string): {
    path: string;
    regex: RegExp;
    keys: string[];
  } {
    const paramKeys: string[] = [];
    const regexString = path
      .replace(/:([^/]+)/g, (_, key) => {
        paramKeys.push(key); // Simpan parameter dinamis
        return "([^/]+)"; // Konversi ke regex
      })
      .replace(/\//g, "\\/");

    const regexPath = new RegExp(`^${regexString}$`);
    return {
      path,
      regex: regexPath,
      keys: paramKeys,
    };
  }

  checkMiddleware(pathMiddleware: string, pathRequestClient: string): boolean {
    // Escape special regex characters except '*'
    const escapedPath = pathMiddleware.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&");

    // Replace '*' with regex wildcard
    const pattern = `^${escapedPath.replace(/\*/g, ".*")}$`;

    // Create a regex from the pattern
    const regex = new RegExp(pattern);

    // Test the client request path against the regex
    return regex.test(pathRequestClient);
  }
}
