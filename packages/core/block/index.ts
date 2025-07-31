import { Priority } from '@gaman/common/utils/priority';
import { RoutesFactory } from '../routes';
import { ServiceFactory } from '../service';
import type {
	AppConfig,
	Context,
	Handler,
	NextResponse,
	RoutesDefinition,
} from '../types';
import { HttpException } from '@gaman/common/error/http-exception';
import { IntegrationFactory } from '../integration';
import { IS_BLOCK_SYMBOL, IS_SERVICE_FACTORY_SYMBOL } from '../symbol';

/**
 * Represents the structure of a block in the application.
 */
export interface BlockFactory<A extends AppConfig> {
	/**
	 * Defines the base path for this block.
	 * All routes within the block are scoped to this path.
	 */
	path?: string;

	/**
	 * Array of included middlewares, blocks, and integrations
	 */
	includes?: Array<Handler<A> | Block<A> | IntegrationFactory<A>>;

	/**
	 * Determines the priority of the block.
	 * Higher priorities are processed earlier.
	 */
	priority?: Priority;

	/**
	 * serves to bind dependencies and services
	 */
	bindings?: Record<string, ServiceFactory<any, any> | any>;

	/**
	 * Defines a set of routes for this block.
	 * Each route maps a path to a specific handler.
	 */
	routes?: Array<RoutesFactory<any, A>>;

	/**
	 * Error handler for the block.
	 * This function is called when an error occurs while processing a request.
	 *
	 * @param error - The error object containing details about the error.
	 * @param ctx - The context object representing the current request.
	 * @returns A `NextResponse` to handle the error gracefully.
	 */
	error?: (
		error: HttpException,
		ctx: Context<A>,
		next: () => NextResponse,
	) => NextResponse;

	'404'?: Handler<A>;
}

export interface Block<A extends AppConfig> extends BlockFactory<A> {
	services_useable: Record<string, any>;
	routes_useable: RoutesDefinition<A>;
}

/**
 * Define a new block for routing, middleware, error handling, etc.
 */
export function defineBlock<A extends AppConfig>(
	block: BlockFactory<A>,
): Block<A> {
	block[IS_BLOCK_SYMBOL] = true;
	if (!block.bindings) block.bindings = {};

	const bindingCaches: Record<string, any> = {}; // * service cache biar ga berat karna pakai proxy

	/**
	 * * Proxy ini adalah Wrapper dinamis jadi bisa ngambil object dinamis mirip lamda lah
	 */
	const context = new Proxy(
		{},
		{
			// * fungsi get ini seperti saat orang pakai context['service'] nah 'service' ini itu prop
			get(_, prop: string) {
				// ? kalau udah ada di cache pakai cache aja!
				if (prop in bindingCaches) return bindingCaches[prop];

				if (prop in block.bindings!) {
					const serviceFactoryOrDependencies = block.bindings![prop];

					// * Jika properti memiliki symbol penanda ServiceFactory,
					// * maka ini adalah sebuah factory function yang harus dipanggil dengan context
					if (serviceFactoryOrDependencies[IS_SERVICE_FACTORY_SYMBOL]) {
						const instance = serviceFactoryOrDependencies(context); // panggil factory-nya
						bindingCaches[prop] = instance; // simpan ke cache supaya tidak dibuat ulang
						return instance;
					} else {
						// * Jika bukan ServiceFactory, berarti ini adalah dependency langsung (instance atau function biasa)
						bindingCaches[prop] = serviceFactoryOrDependencies; // simpan ke cache supaya tidak dibuat ulang
						return serviceFactoryOrDependencies;
					}
				}

				return undefined;
			},
		},
	);

	// * register services_useable artinya services yang bakal di pakai
	const services_useable: Record<string, any> = {};
	if (block.bindings) {
		for (const [key, factory] of Object.entries(block.bindings)) {
			if (factory[IS_SERVICE_FACTORY_SYMBOL]) {
				services_useable[key] = factory(context);

				/**
				 * kurang lebih seprti ini
				 *
				 * Contoh `example.service.ts`
				 *
				 * ```ts
				 * * nah (prisma, otherService) itu dia bakal ngambil dari context
				 * export default defineService((prisma, otherService) => ({
				 *
				 * 	findAll: () => {}
				 * }))
				 * ```
				 */
			}
		}
	}

	// * register routes_useable artinya routes yang bakal di pakai
	let routes_useable: RoutesDefinition<A> = {};
	if (block.routes) {
		for (const factory of block.routes) {
			const routes = factory(context);
			routes_useable = { ...routes_useable, ...routes };

			/**
			 * kurang lebih seprti ini
			 *
			 * Contoh `example.routes.ts`
			 *
			 * ```ts
			 * * nah (prisma, omainServicee) itu dia bakal ngambil dari context
			 * export default defineRoutes((prisma, mainService) => ({
			 *
			 * 	"/article": () => {}
			 * }))
			 * ```
			 */
		}
	}

	return {
		...block,
		services_useable: services_useable,
		routes_useable,
	};
}
