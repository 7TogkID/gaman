import { HttpException } from "../../error";
import { RoutesFactory } from "../../routes";
import { ServiceFactory } from "../../service";
import type { AppConfig, Context, Handler, NextResponse, Priority, RoutesDefinition } from "../../types";
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
    error?: (error: HttpException, ctx: Context<A>, next: () => NextResponse) => NextResponse;
    "404"?: Handler<A>;
    services?: Record<string, ServiceFactory<any, any>>;
    depedencies?: Record<string, any>;
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
export declare function defineBlock<A extends AppConfig>(block: BlockFactory<A>): Block<A>;
