/**
 * @module
 * Basic Auth Middleware for Gaman.
 * Provides HTTP Basic Authentication middleware that supports both static
 * credentials and dynamic verification logic.
 */
import { AppConfig, Context, Handler } from "../../types";
export type MessageFunction = (ctx: Context) => string | object | Promise<string | object>;
/**
 * Options for configuring Basic Authentication middleware.
 *
 * You can use either a static username/password combination or a dynamic
 * `verifyAuth` function to validate credentials.
 */
export type BasicAuthOptions = {
    /** The static username for authentication. */
    username: string;
    /** The static password for authentication. */
    password: string;
    /** Optional realm for the authentication challenge. */
    realm?: string;
    /**
     * Custom message returned on invalid authentication.
     * Can be a string, object, or a function that generates a response message.
     */
    invalidAuthMessage?: string | object | MessageFunction;
} | {
    /**
     * A function to dynamically validate credentials.
     * Receives the username, password, and context.
     */
    verifyAuth: (username: string, password: string, c: Context) => boolean | Promise<boolean>;
    /** Optional realm for the authentication challenge. */
    realm?: string;
    /**
     * Custom message returned on invalid authentication.
     * Can be a string, object, or a function that generates a response message.
     */
    invalidAuthMessage?: string | object | MessageFunction;
};
/**
 * Basic Authentication middleware for Gaman.
 * @param options - The options for configuring Basic Authentication.
 * @returns A middleware function to enforce HTTP Basic Authentication.
 *
 * @throws {Error} If neither `username/password` nor `verifyAuth` is provided.
 */
export declare const basicAuth: (options: BasicAuthOptions) => Handler<AppConfig>;
