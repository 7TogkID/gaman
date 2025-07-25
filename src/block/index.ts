import { HttpException } from "../error";
import { RoutesFactory } from "../routes";
import { ServiceFactory } from "../service";
import type {
  AppConfig,
  Context,
  Handler,
  NextResponse,
  Priority,
  RoutesDefinition,
  WebSocketServerHandler,
} from "../types";

/**
 * Represents the structure of a block in the application.
 */
export interface BlockFactory<A extends AppConfig> {
  /**
   * Array of included middlewares
   */
  includes?: Array<Handler<A>>;

  /**
   * Array of blocks
   */
  blocks?: Array<Block<A>>;

  /**
   * Determines the priority of the block.
   * Higher priorities are processed earlier.
   */
  priority?: Priority;

  /**
   * Specifies the domain under which this block operates.
   * If omitted, the block applies to all domains.
   */
  domain?: string;

  /**
   * Defines the base path for this block.
   * All routes and WebSocket handlers within the block are scoped to this path.
   */
  path?: string;

  /**
   * Handler for HTTP requests that do not match any defined route in the block.
   */
  notFound?: Handler<A>;

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
    next: () => NextResponse
  ) => NextResponse;

  services?: Record<string, ServiceFactory<any, any>>;

  depedencies?: Record<string, any>;

  /**
   * Defines a set of routes for this block.
   * Each route maps a path to a specific handler.
   */
  routes?: Array<RoutesFactory<any, A>>;

  /**
   * WebSocket server handler for the block.
   * This handles WebSocket connections scoped to the block's path.
   */
  websocket?: WebSocketServerHandler;
}

export interface Block<A extends AppConfig> extends BlockFactory<A> {
  services_useable: Record<string, any>;
  routes_useable: RoutesDefinition<A>;
}

/**
 * Define a new block for routing, middleware, error handling, etc.
 */
export function defineBlock<A extends AppConfig>(
  block: BlockFactory<A>
): Block<A> {
  if (!block.depedencies) block.depedencies = {};

  let services_useable: Record<string, any> = {};
  if (block.services) {
    for (const [key, factory] of Object.entries(block.services)) {
      services_useable[key] = factory(block.depedencies || {});
    }
  }

  let routes_useable: RoutesDefinition<A> = {};
  if (block.routes) {
    for (const routeFactory of block.routes) {
      const routes = routeFactory({
        ...services_useable,
        ...block.depedencies,
      });
      routes_useable = { ...routes_useable, ...routes };
    }
  }

  return {
    ...block,
    services_useable,
    routes_useable,
  };
}
