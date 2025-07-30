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
	 * Array of included middlewares
	 */
	includes?: Array<Handler<A>>;

	/**
	 * Array of block modules
	 */
	blocks?: Array<Block<A>>;

	/**
	 * Determines the priority of the block.
	 * Higher priorities are processed earlier.
	 */
	priority?: Priority;
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

	services?: Record<string, ServiceFactory<any, any>>;

	dependencies?: Record<string, any>;

	/**
	 * Defines a set of routes for this block.
	 * Each route maps a path to a specific handler.
	 */
	routes?: Array<RoutesFactory<any, A>>;
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
	if (!block.dependencies) block.dependencies = {};
	if (!block.services) block.services = {};
  
	const serviceCache: Record<string, any> = {}; // * service cache biar ga berat karna pakai proxy

  /**
   * * Proxy ini adalah Wrapper dinamis jadi bisa ngambil object dinamis mirip lamda lah
   */
	const context = new Proxy(
		{},
		{
      // * fungsi get ini seperti saat orang pakai context['service'] nah 'service' ini itu prop
			get(_, prop: string) {
        // ? kalau udah ada di cache pakai cache aja!
				if (prop in serviceCache) return serviceCache[prop];

				if (prop in block.services!) {
					const factory = block.services![prop];
					const instance = factory(context);
					serviceCache[prop] = instance;
					return instance;
				}
        
				if (prop in block.dependencies!) return block.dependencies![prop];

				return undefined;
			},
		},
	);

  // * register services_useable artinya services yang bakal di pakai
	const services_useable: Record<string, any> = {};
	if (block.services) {
		for (const [key, factory] of Object.entries(block.services)) {
			services_useable[key] = factory(context);
		}
	}

	// * register routes_useable artinya routes yang bakal di pakai
	let routes_useable: RoutesDefinition<A> = {};
	if (block.routes) {
		for (const factory of block.routes) {
			const routes = factory(context);
			routes_useable = { ...routes_useable, ...routes };
		}
	}

	return {
		...block,
		services_useable,
		routes_useable,
	};
}
