import type {
	Context,
	AppConfig,
	NextResponse,
	RoutesDefinition,
} from './types';
import * as http from 'node:http';
import { Log } from '@gaman/common/utils/logger';
import { createContext } from './context';
import {
	formatPath,
	isHtmlString,
	removeEndSlash,
} from '@gaman/common/utils/utils';
import { Response } from './response';
import { sortArrayByPriority } from '@gaman/common/utils/priority';
import { performance } from 'perf_hooks';
import { HttpException } from '@gaman/common/error/http-exception';
import { GamanWebSocket } from './web-socket';
import { Readable } from 'node:stream';
import * as path from 'node:path';
import { HTTP_RESPONSE_SYMBOL } from './symbol';
import { GamanCookies } from './context/cookies';
import { IGNORED_LOG_FOR_PATH_REGEX } from './constant';
import { next } from './next';
import { Block } from './block';
import { IntegrationFactory } from './integration';

export class GamanApp<A extends AppConfig = any> {
	#blocks: Block<A>[] = [];
	#websocket: GamanWebSocket<A>;
	#integrations: Array<ReturnType<IntegrationFactory<A>>> = [];
	#server: http.Server<
		typeof http.IncomingMessage,
		typeof http.ServerResponse
	> | null = null;
	#strict = false;

	get blocks() {
		return this.#blocks;
	}
	get integrations() {
		return this.#integrations;
	}
	get server() {
		return this.#server;
	}
	get strict() {
		return this.#strict;
	}

	/**
	 * must use slash '/' at the end of the path
	 * @example '/user/detail/'
	 * @default true
	 */
	setStrict(v: boolean = true) {
		this.#strict = v;
	}

	/**
	 * Register one or more integrations into the application lifecycle.
	 * Each integration will be instantiated using its factory and stored internally.
	 * Executes `onLoad()` if the integration provides it.
	 *
	 * @param integrationFactories - A list of factory functions that return Integration objects.
	 */
	registerIntegration(...integrationFactories: IntegrationFactory<A>[]) {
		for (const factory of integrationFactories) {
			const integration = factory(this);
			this.#integrations.push(integration);
			integration.onLoad?.();
		}
	}

	constructor(private mainBlock: Block<A>) {
		this.#websocket = new GamanWebSocket(this);
	}

	getBlock(blockPath: string): Block<A> | undefined {
		const path = formatPath(blockPath, this.#strict);
		const block: Block<A> | undefined = this.#blocks.find(
			(b) => formatPath(b.path || '/', this.#strict) === path,
		);
		return block;
	}

	private registerBlocks() {
		/**
		 * * EN: Initialize Blocks and childrens
		 * * ID: inisialisasi blocks dan childrens nya
		 */
		if (this.#blocks.some((b) => b.path === this.mainBlock?.path || '/')) {
			throw new Error(`Block '${this.mainBlock.path}' already exists!`);
		}

		// if (this.mainBlock.websocket) {
		//   this.#websocket.registerWebSocketServer(this.mainBlock);
		// }
		const startTime = performance.now();
		register(this.mainBlock, this);

		// Initialize block childrens
		function initChilderns(
			basePath: string,
			childrens: Array<Block<A>>,
			app: GamanApp<A>,
		) {
			for (const blockChild of childrens) {
				const childPath = path.join(basePath, blockChild.path || '/');
				if (app.#blocks.some((b) => b.path === childPath)) {
					throw new Error(`Block '${childPath}' already exists!`);
				}

				// if (blockChild.websocket) {
				//   app.#websocket.registerWebSocketServer(blockChild);
				// }

				blockChild.path = childPath;
				register(blockChild, app);

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
		initChilderns(
			this.mainBlock.path || '/',
			this.mainBlock.blocks || [],
			this,
		);
		const endTime = performance.now();
		Log.info(
			`${this.#blocks.length} Blocks have been registered §a(${(
				endTime - startTime
			).toFixed(1)}ms)§r`,
		);

		// * tambahin "/" di belakang kalau strict
		function register(block: Block<A>, app: GamanApp<A>) {
			block.path = formatPath(block.path || '/', app.#strict);
			app.#blocks.push(block);
		}
	}

	private async requestHandle(
		req: http.IncomingMessage,
		res: http.ServerResponse,
	) {
		const startTime = performance.now();
		const ctx = await createContext<A>(this, req, res);
		Log.setRoute(ctx.request.pathname || '/');
		Log.setMethod(ctx.request.method.toUpperCase());
		try {
			const blocksAndIntegrations = sortArrayByPriority<
				Block<A> | ReturnType<IntegrationFactory<A>>
			>(
				[...this.#blocks, ...this.#integrations],
				'priority',
				'asc', //  1, 2, 3, 4, 5 // kalau desc: 5, 4, 3, 2, 1
			);
			for await (const blockOrIntegration of blocksAndIntegrations) {
				if ('routes' in blockOrIntegration) {
					const block = blockOrIntegration as Block<A>;
					try {
						/**
						 * * Jika path depannya aja udah gak sama berarti gausah di lanjutin :V
						 */

						if (!(block.path && ctx.request.pathname.startsWith(block.path))) {
							continue;
						}

						if (block.includes) {
							for (const middleware of block.includes) {
								const result = await middleware(ctx, next);

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
						const result = await this.handleRoutes(
							block.routes_useable,
							ctx,
							block.path,
						);

						/**
						 * * Disini gausah di kurung seperti di block.all() tadi
						 * * Karna disini adalah respon akhir dari handle routes!
						 */
						if (result) {
							return await this.handleResponse(result, ctx);
						}
					} catch (error: any) {
						if (block.error) {
							// ! Block Error handler
							const result = await block.error(
								new HttpException(403, error.message, error),
								ctx,
								next,
							);
							if (result) {
								return await this.handleResponse(result, ctx);
							}
						}
						throw new HttpException(403, error.message, error);
					}
				} else if ('onRequest' in blockOrIntegration) {
					const integration = blockOrIntegration as ReturnType<
						IntegrationFactory<A>
					>;
					const result = await integration.onRequest?.(ctx);
					if (result) {
						return await this.handleResponse(result, ctx);
					}
				}
			}

			// not found
			return await this.handleResponse(
				new Response(undefined, { status: 404 }),
				ctx,
			);
		} catch (error: any) {
			Log.error(error.message);
			console.error(error.details);
			return await this.handleResponse(
				new Response(undefined, { status: 500 }),
				ctx,
			);
		} finally {
			const endTime = performance.now();

			/**
			 * * kalau route dan status = null di tengah jalan
			 * * berarti gausah di kasih log
			 */
			if (
				Log.response.route &&
				Log.response.status &&
				Log.response.method &&
				!IGNORED_LOG_FOR_PATH_REGEX.test(Log.response.route)
			) {
				Log.log(
					`Request processed in §a(${(endTime - startTime).toFixed(1)}ms)§r`,
				);
			}
			Log.setRoute('');
			Log.setMethod('');
			Log.setStatus(null);
		}
	}

	private async handleRoutes(
		routes: RoutesDefinition<A>,
		ctx: Context<A>,
		basePath: string = '/',
	): Promise<NextResponse> {
		for await (const [path, handler] of Object.entries(routes)) {
			/**
			 * * format path biar bisa nested path
			 * *
			 * * dan di belakang nya kasih "/" kalau dia strict
			 */
			const routeFullPath = formatPath(`${basePath}/${path}`, this.#strict);

			// * setiap request di createParamRegex nya dari path Server
			const regexParam = this.createParamRegex(routeFullPath);

			/**
			 * * kalau strict pakai pathname full
			 * * kalau non strict, hapus slash akhir biar bisa "/home" dan "/home/"
			 */
			const requestPath = this.#strict
				? ctx.request.pathname
				: removeEndSlash(ctx.request.pathname);
			// ? apakah path dari client dan path server itu valid?
			const match = regexParam.regex.exec(requestPath);

			/**
			 * * Jika match param itu tidak null
			 * * berarti di ctx.params[key] add param yang ada
			 */
			regexParam.keys.forEach((key, index) => {
				ctx.params[key] = match?.[index + 1] || '';
			});

			// * Jika ada BINTANG (*) berarti middleware
			const isMiddleware = routeFullPath.includes('*');

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
					const result = await handle(ctx, next);
					if (result) return result; // Lanjut handler lain jika tidak ada respon
				}
			} else if (typeof handler === 'function' && isValid) {
				/**
				 * * jalanin handler jika ($handler) adalah type Handler dan pathMatch valid
				 */
				const result = await handler(ctx, next);
				if (result) return result; // Lanjut handler lain jika tidak ada respon
			} else if (typeof handler === 'object') {
				for await (const [methodOrPathNested, nestedHandler] of Object.entries(
					handler,
				)) {
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
					if (
						this.isHttpMethod(methodOrPathNested) &&
						methodOrPathNested.toLowerCase() ===
							ctx.request.method.toLowerCase()
					) {
						/**
						 * * validasi (match) itu dari params
						 */
						if (Array.isArray(nestedHandler) && isValid) {
							for await (const handle of nestedHandler) {
								const result = await handle(ctx, next);
								if (result) return result;
							}
						} else if (typeof nestedHandler === 'function' && isValid) {
							const result = await nestedHandler(ctx, next);
							if (result) return result;
						}
					} else {
						if (nestedHandler) {
							// * Lakukan Proses Nested jika ada pathNested
							const result = await this.handleRoutes(
								{ [methodOrPathNested]: nestedHandler },
								ctx,
								routeFullPath,
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
	}

	private async handleResponse(
		result: string | object | any[] | Response | undefined,
		ctx: Context<A>,
	) {
		//@ts-ignore
		const res: http.ServerResponse = ctx[HTTP_RESPONSE_SYMBOL];
		if (res.writableEnded) return; // * ignore process if response finished

		const isResponse = (value: unknown): value is Response => {
			return value instanceof Response;
		};

		/**
		 * * substitue result
		 * @default response 404
		 */
		let response: Response = new Response(undefined, { status: 404 });

		if (isResponse(result)) {
			response = result;
		} else {
			/**
			 * * intialize response without class Response
			 * @example return {message: "OK"}; or return "OK!";
			 */
			if (typeof result === 'string') {
				if (isHtmlString(result)) {
					response = Response.html(result, {
						status: 200,
					});
				} else {
					response = Response.text(result, {
						status: 200,
					});
				}
			} else if (result) {
				response = Response.json(result, {
					status: 200,
				});
			}
		}

		/**
		 * * proccess integrations first
		 */
		if (this.#integrations) {
			const integrations = sortArrayByPriority<
				ReturnType<IntegrationFactory<A>>
			>(this.#integrations, 'priority', 'asc');

			for (const integration of integrations) {
				if (integration.onResponse) {
					const integrationResponse = await integration.onResponse(
						ctx,
						response,
					);
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
		const cookieHeaders = Array.from(GamanCookies.consume(ctx.cookies));
		if (cookieHeaders.length > 0) {
			response.headers.set('Set-Cookie', cookieHeaders);
		}

		// * initialize http response
		res.statusCode = response.status;
		res.statusMessage = response.statusText;
		res.setHeaders(response.headers.toMap());
		Log.setStatus(response.status);

		if (response.body instanceof Readable) {
			return response.body.pipe(res);
		}
		return res.end(response.body);
	}

	listen(port: number = 3431, host: string = 'localhost', cb: () => any) {
		this.registerBlocks(); // register all Block

		this.#server = http.createServer(this.requestHandle.bind(this));

		this.#server.on('upgrade', (request, socket, head) => {
			const urlString = request.url || '/';
			const { pathname } = new URL(urlString, `http://${request.headers.host}`);

			const wss = this.#websocket.getWebSocketServer(pathname);
			if (wss) {
				wss.handleUpgrade(request, socket, head, function done(ws) {
					wss.emit('connection', ws, request);
				});
			} else {
				socket.destroy();
			}
		});

		this.#server.listen(port, host, cb);
	}

	close(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.#server) {
				this.#server.close((err) => {
					if (err) reject(err);
					else resolve();
				});
			} else {
				resolve();
			}
		});
	}

	/**
	 * Checks if a string is a valid HTTP method
	 * @param method - String to check
	 * @returns True if the string is a valid HTTP method
	 */
	private isHttpMethod(method: string): boolean {
		return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].includes(
			method.toUpperCase(),
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
				return '([^/]+)'; // Konversi ke regex
			})
			.replace(/\//g, '\\/');

		const regexPath = new RegExp(`^${regexString}$`);
		return {
			path,
			regex: regexPath,
			keys: paramKeys,
		};
	}

	private checkMiddleware(pathMiddleware: string, pathRequestClient: string): boolean {
		// Escape special regex characters except '*'
		const escapedPath = pathMiddleware.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');

		// Replace '*' with regex wildcard
		const pattern = `^${escapedPath.replace(/\*/g, '.*')}$`;

		// Create a regex from the pattern
		const regex = new RegExp(pattern);

		// Test the client request path against the regex
		return regex.test(pathRequestClient);
	}
}
