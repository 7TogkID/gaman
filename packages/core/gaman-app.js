"use strict";
var _GamanApp_blocks, _GamanApp_websocket, _GamanApp_integrations, _GamanApp_server, _GamanApp_strict;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamanApp = void 0;
const tslib_1 = require("tslib");
const http = require("node:http");
const logger_1 = require("./utils/logger");
const context_1 = require("./context");
const utils_1 = require("./utils/utils");
const response_1 = require("./response");
const priority_1 = require("./utils/priority");
const perf_hooks_1 = require("perf_hooks");
const http_exception_1 = require("./error/http-exception");
const web_socket_1 = require("./web-socket");
const node_stream_1 = require("node:stream");
const path = require("node:path");
const symbol_1 = require("./symbol");
const cookies_1 = require("./context/cookies");
const constant_1 = require("./constant");
const next_1 = require("./next");
class GamanApp {
    get blocks() {
        return tslib_1.__classPrivateFieldGet(this, _GamanApp_blocks, "f");
    }
    get integrations() {
        return tslib_1.__classPrivateFieldGet(this, _GamanApp_integrations, "f");
    }
    get server() {
        return tslib_1.__classPrivateFieldGet(this, _GamanApp_server, "f");
    }
    get strict() {
        return tslib_1.__classPrivateFieldGet(this, _GamanApp_strict, "f");
    }
    /**
     * must use slash '/' at the end of the path
     * @example '/user/detail/'
     * @default true
     */
    setStrict(v = true) {
        tslib_1.__classPrivateFieldSet(this, _GamanApp_strict, v, "f");
    }
    registerIntegration(integrationFactory) {
        const integration = integrationFactory(this);
        tslib_1.__classPrivateFieldGet(this, _GamanApp_integrations, "f").push(integration);
        integration.onLoad?.();
    }
    constructor(mainBlock) {
        _GamanApp_blocks.set(this, []);
        _GamanApp_websocket.set(this, void 0);
        _GamanApp_integrations.set(this, []);
        _GamanApp_server.set(this, null);
        _GamanApp_strict.set(this, false);
        tslib_1.__classPrivateFieldSet(this, _GamanApp_websocket, new web_socket_1.GamanWebSocket(this), "f");
        /**
         * * EN: Initialize Blocks and childrens
         * * ID: inisialisasi blocks dan childrens nya
         */
        if (tslib_1.__classPrivateFieldGet(this, _GamanApp_blocks, "f").some((b) => b.path === mainBlock?.path)) {
            throw new Error(`Block '${mainBlock.path}' already exists!`);
        }
        // if (mainBlock.websocket) {
        //   this.#websocket.registerWebSocketServer(mainBlock);
        // }
        const startTime = perf_hooks_1.performance.now();
        this.registerBlock(mainBlock);
        // Initialize block childrens
        function initChilderns(basePath, childrens, app) {
            for (const blockChild of childrens) {
                const childPath = path.join(basePath, blockChild.path || "/");
                if (tslib_1.__classPrivateFieldGet(app, _GamanApp_blocks, "f").some((b) => b.path === childPath)) {
                    throw new Error(`Block '${childPath}' already exists!`);
                }
                // if (blockChild.websocket) {
                //   app.#websocket.registerWebSocketServer(blockChild);
                // }
                blockChild.path = childPath;
                app.registerBlock(blockChild);
                /**
                 * * EN: initialize childerns from children
                 * * ID: inisialisasi childrens dari children
                 */
                if (blockChild.blocks) {
                    initChilderns(childPath, blockChild.blocks, app);
                }
            }
        }
        // * init childrens
        initChilderns(mainBlock.path || "/", mainBlock.blocks || [], this);
        const endTime = perf_hooks_1.performance.now();
        logger_1.Log.info(`${tslib_1.__classPrivateFieldGet(this, _GamanApp_blocks, "f").length} Blocks have been registered §a(${(endTime - startTime).toFixed(1)}ms)§r`);
    }
    getBlock(blockPath) {
        const path = (0, utils_1.formatPath)(blockPath, tslib_1.__classPrivateFieldGet(this, _GamanApp_strict, "f"));
        const block = tslib_1.__classPrivateFieldGet(this, _GamanApp_blocks, "f").find((b) => (0, utils_1.formatPath)(b.path || "/", tslib_1.__classPrivateFieldGet(this, _GamanApp_strict, "f")) === path);
        return block;
    }
    registerBlock(block) {
        // * tambahin "/" di belakang kalau strict
        block.path = (0, utils_1.formatPath)(block.path || "/", tslib_1.__classPrivateFieldGet(this, _GamanApp_strict, "f"));
        tslib_1.__classPrivateFieldGet(this, _GamanApp_blocks, "f").push(block);
    }
    async requestHandle(req, res) {
        const startTime = perf_hooks_1.performance.now();
        const ctx = await (0, context_1.createContext)(this, req, res);
        logger_1.Log.setRoute(ctx.request.pathname || "/");
        logger_1.Log.setMethod(ctx.request.method.toUpperCase());
        try {
            const blocksAndIntegrations = (0, priority_1.sortArrayByPriority)([...tslib_1.__classPrivateFieldGet(this, _GamanApp_blocks, "f"), ...tslib_1.__classPrivateFieldGet(this, _GamanApp_integrations, "f")], "priority", "asc" //  1, 2, 3, 4, 5 // kalau desc: 5, 4, 3, 2, 1
            );
            for await (const blockOrIntegration of blocksAndIntegrations) {
                if ("routes" in blockOrIntegration) {
                    const block = blockOrIntegration;
                    try {
                        /**
                         * * Jika path depannya aja udah gak sama berarti gausah di lanjutin :V
                         */
                        if (!(block.path && ctx.request.pathname.startsWith(block.path))) {
                            continue;
                        }
                        if (block.includes) {
                            for (const middleware of block.includes) {
                                const result = await middleware(ctx, next_1.next);
                                /**
                                 * ? Kenapa harus di kurung di if(result){...} ???
                                 * * Karena di bawahnya masih ada yang harus di proses seperti routes...
                                 * * Kalau tidak di kurung maka, dia bakal jalanin middleware doang routesnya ga ke proses
                                 */
                                if (result) {
                                    return await this.handleResponse(result, ctx);
                                }
                            }
                        }
                        // Process routes
                        const result = await this.handleRoutes(block.routes_useable, ctx, block.path);
                        /**
                         * * Disini gausah di kurung seperti di block.all() tadi
                         * * Karna disini adalah respon akhir dari handle routes!
                         */
                        if (result) {
                            return await this.handleResponse(result, ctx);
                        }
                    }
                    catch (error) {
                        if (block.error) {
                            // ! Block Error handler
                            const result = await block.error(new http_exception_1.HttpException(403, error.message, error), ctx, next_1.next);
                            if (result) {
                                return await this.handleResponse(result, ctx);
                            }
                        }
                        throw new http_exception_1.HttpException(403, error.message, error);
                    }
                }
                else if ("onRequest" in blockOrIntegration) {
                    const integration = blockOrIntegration;
                    const result = await integration.onRequest?.(ctx);
                    if (result) {
                        return await this.handleResponse(result, ctx);
                    }
                }
            }
            // not found
            return await this.handleResponse(new response_1.Response(undefined, { status: 404 }), ctx);
        }
        catch (error) {
            logger_1.Log.error(error.message);
            console.error(error.details);
            return await this.handleResponse(new response_1.Response(undefined, { status: 500 }), ctx);
        }
        finally {
            const endTime = perf_hooks_1.performance.now();
            /**
             * * kalau route dan status = null di tengah jalan
             * * berarti gausah di kasih log
             */
            if (logger_1.Log.response.route &&
                logger_1.Log.response.status &&
                logger_1.Log.response.method &&
                !constant_1.IGNORED_LOG_FOR_PATH_REGEX.test(logger_1.Log.response.route)) {
                logger_1.Log.log(`Request processed in §a(${(endTime - startTime).toFixed(1)}ms)§r`);
            }
            logger_1.Log.setRoute("");
            logger_1.Log.setMethod("");
            logger_1.Log.setStatus(null);
        }
    }
    async handleRoutes(routes, ctx, basePath = "/") {
        for await (const [path, handler] of Object.entries(routes)) {
            /**
             * * format path biar bisa nested path
             * *
             * * dan di belakang nya kasih "/" kalau dia strict
             */
            const routeFullPath = (0, utils_1.formatPath)(`${basePath}/${path}`, tslib_1.__classPrivateFieldGet(this, _GamanApp_strict, "f"));
            // * setiap request di createParamRegex nya dari path Server
            const regexParam = this.createParamRegex(routeFullPath);
            /**
             * * kalau strict pakai pathname full
             * * kalau non strict, hapus slash akhir biar bisa "/home" dan "/home/"
             */
            const requestPath = tslib_1.__classPrivateFieldGet(this, _GamanApp_strict, "f")
                ? ctx.request.pathname
                : (0, utils_1.removeEndSlash)(ctx.request.pathname);
            // ? apakah path dari client dan path server itu valid?
            const match = regexParam.regex.exec(requestPath);
            /**
             * * Jika match param itu tidak null
             * * berarti di ctx.params[key] add param yang ada
             */
            regexParam.keys.forEach((key, index) => {
                ctx.params[key] = match?.[index + 1] || "";
            });
            // * Jika ada BINTANG (*) berarti middleware
            const isMiddleware = routeFullPath.includes("*");
            /**
             * * Jika dia middleware maka pake fungsi check middleware
             * * Jika dia bukan middleware maka pake match
             */
            const isValid = isMiddleware
                ? this.checkMiddleware(routeFullPath, ctx.request.pathname)
                : match !== null;
            /**
             * * validasi (match) itu dari params
             */
            if (Array.isArray(handler) && isValid) {
                /**
                 * * jalanin handler jika ($handler) adalah type Array<Handler> dan pathMatch valid
                 */
                for await (const handle of handler) {
                    const result = await handle(ctx, next_1.next);
                    if (result)
                        return result; // Lanjut handler lain jika tidak ada respon
                }
            }
            else if (typeof handler === "function" && isValid) {
                /**
                 * * jalanin handler jika ($handler) adalah type Handler dan pathMatch valid
                 */
                const result = await handler(ctx, next_1.next);
                if (result)
                    return result; // Lanjut handler lain jika tidak ada respon
            }
            else if (typeof handler === "object") {
                for await (const [methodOrPathNested, nestedHandler] of Object.entries(handler)) {
                    /**
                     * * Jika dia bukan method berarti dia berupa nestedPath
                     * * Dan Method Routes sama Method Request harus sama
                     * @example
                     * routes: {
                     *   "/": {
                     * 			GET: () => "OK!", // kalau request get dia pakai handler ini
                     *      POST: () => "OK! POST" // kalau request post dia pakai handler ini
                     *   }
                     * }
                     */
                    if (this.isHttpMethod(methodOrPathNested) &&
                        methodOrPathNested.toLowerCase() ===
                            ctx.request.method.toLowerCase()) {
                        /**
                         * * validasi (match) itu dari params
                         */
                        if (Array.isArray(nestedHandler) && isValid) {
                            for await (const handle of nestedHandler) {
                                const result = await handle(ctx, next_1.next);
                                if (result)
                                    return result;
                            }
                        }
                        else if (typeof nestedHandler === "function" && isValid) {
                            const result = await nestedHandler(ctx, next_1.next);
                            if (result)
                                return result;
                        }
                    }
                    else {
                        if (nestedHandler) {
                            // * Lakukan Proses Nested jika ada pathNested
                            const result = await this.handleRoutes({ [methodOrPathNested]: nestedHandler }, ctx, routeFullPath);
                            /**
                             * * Kalau kalau dia ada result langsung response
                             * * Kalau gak ada lanjut ke route berikutnya...
                             */
                            if (result)
                                return result;
                        }
                    }
                }
            }
        }
    }
    async handleResponse(result, ctx) {
        //@ts-ignore
        const res = ctx[symbol_1.HTTP_RESPONSE_SYMBOL];
        if (res.writableEnded)
            return; // * ignore process if response finished
        const isResponse = (value) => {
            return value instanceof response_1.Response;
        };
        /**
         * * substitue result
         * @default response 404
         */
        let response = new response_1.Response(undefined, { status: 404 });
        if (isResponse(result)) {
            response = result;
        }
        else {
            /**
             * * intialize response without class Response
             * @example return {message: "OK"}; or return "OK!";
             */
            if (typeof result === "string") {
                if ((0, utils_1.isHtmlString)(result)) {
                    response = response_1.Response.html(result, {
                        status: 200,
                    });
                }
                else {
                    response = response_1.Response.text(result, {
                        status: 200,
                    });
                }
            }
            else if (result) {
                response = response_1.Response.json(result, {
                    status: 200,
                });
            }
        }
        /**
         * * proccess integrations first
         */
        if (tslib_1.__classPrivateFieldGet(this, _GamanApp_integrations, "f")) {
            const integrations = (0, priority_1.sortArrayByPriority)(tslib_1.__classPrivateFieldGet(this, _GamanApp_integrations, "f"), "priority", "asc");
            for (const integration of integrations) {
                if (integration.onResponse) {
                    const integrationResponse = await integration.onResponse(ctx, response);
                    if (integrationResponse) {
                        response = integrationResponse;
                        break;
                    }
                }
            }
        }
        /**
         * set cookies
         */
        const cookieHeaders = Array.from(cookies_1.GamanCookies.consume(ctx.cookies));
        if (cookieHeaders.length > 0) {
            response.headers.set("Set-Cookie", cookieHeaders);
        }
        // * initialize http response
        res.statusCode = response.status;
        res.statusMessage = response.statusText;
        res.setHeaders(response.headers.toMap());
        logger_1.Log.setStatus(response.status);
        if (response.body instanceof node_stream_1.Readable) {
            return response.body.pipe(res);
        }
        return res.end(response.body);
    }
    listen(port = 3431, host = "localhost", cb) {
        tslib_1.__classPrivateFieldSet(this, _GamanApp_server, http.createServer(this.requestHandle.bind(this)), "f");
        tslib_1.__classPrivateFieldGet(this, _GamanApp_server, "f").on("upgrade", (request, socket, head) => {
            const urlString = request.url || "/";
            const { pathname } = new URL(urlString, `http://${request.headers.host}`);
            const wss = tslib_1.__classPrivateFieldGet(this, _GamanApp_websocket, "f").getWebSocketServer(pathname);
            if (wss) {
                wss.handleUpgrade(request, socket, head, function done(ws) {
                    wss.emit("connection", ws, request);
                });
            }
            else {
                socket.destroy();
            }
        });
        tslib_1.__classPrivateFieldGet(this, _GamanApp_server, "f").listen(port, host, cb);
    }
    close() {
        return new Promise((resolve, reject) => {
            if (tslib_1.__classPrivateFieldGet(this, _GamanApp_server, "f")) {
                tslib_1.__classPrivateFieldGet(this, _GamanApp_server, "f").close((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    /**
     * Checks if a string is a valid HTTP method
     * @param method - String to check
     * @returns True if the string is a valid HTTP method
     */
    isHttpMethod(method) {
        return ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"].includes(method.toUpperCase());
    }
    createParamRegex(path) {
        const paramKeys = [];
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
    checkMiddleware(pathMiddleware, pathRequestClient) {
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
exports.GamanApp = GamanApp;
_GamanApp_blocks = new WeakMap(), _GamanApp_websocket = new WeakMap(), _GamanApp_integrations = new WeakMap(), _GamanApp_server = new WeakMap(), _GamanApp_strict = new WeakMap();
