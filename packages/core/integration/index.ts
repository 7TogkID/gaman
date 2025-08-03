import { Priority } from '@gaman/common/utils/priority';
import { GamanApp } from '../gaman-app';
import { Response } from '../response';
import { AppConfig, Context, NextResponse } from '../types';
import { IS_INTEGRATION_FACTORY_SYMBOL } from '../symbol';
import { Block } from '../block';
import http from 'node:http';

/**
 * A factory function that defines a GamanJS integration.
 * Integrations can hook into different phases of the app lifecycle such as
 * server start, request handling, and block registration.
 *
 * @template A - The application config type.
 */
export type IntegrationFactory<A extends AppConfig = AppConfig> = (
	app: GamanApp<A>,
) => {
	/**
	 * The unique name of the integration.
	 * This is required to identify the integration.
	 */
	name: string;

	/**
	 * The execution priority of the integration.
	 * Higher priority integrations are executed before lower ones.
	 * This helps control the order of lifecycle hooks like `onLoad` or `onRequest`.
	 */
	priority: Priority;

	/**
	 * Hook that is called when the integration is first loaded.
	 * You can perform initial setup or register handlers here.
	 */
	onLoad?: () => any;

	/**
	 * Hook that is triggered every time the server receives a request.
	 * Useful for modifying context, adding middleware-like behavior,
	 * or short-circuiting the request.
	 *
	 * @param ctx - The current request context.
	 * @returns A NextResponse to handle the request or let it continue.
	 */
	onRequest?: (ctx: Context<A>) => NextResponse;

	/**
	 * Hook that runs just before the response is sent back to the client.
	 * You can use this to transform or wrap the final response.
	 *
	 * @param ctx - The current request context.
	 * @param res - The original response object.
	 * @returns The modified or final response.
	 */
	onResponse?: (ctx: Context<A>, res: Response) => Promise<Response> | Response;

	/**
	 * Hook that is called when a new block is registered into the app.
	 * Use this to modify, validate, or extend blocks.
	 *
	 * @param block - The block being registered.
	 */
	onBlockRegister?: (block: Block<A>) => any;

	/**
	 * Hook that runs when the server starts listening.
	 * You can use this to log, set up websockets, or perform other tasks tied to the server.
	 *
	 * @param server - The Node.js HTTP server instance (or null in non-server runtimes).
	 */
	onListen?: (
		server: http.Server<
			typeof http.IncomingMessage,
			typeof http.ServerResponse
		> | null,
	) => any;
};

export function defineIntegration<A extends AppConfig>(
	factory: IntegrationFactory<A>,
): IntegrationFactory<A> {
	factory[IS_INTEGRATION_FACTORY_SYMBOL] = true;
	return factory;
}
