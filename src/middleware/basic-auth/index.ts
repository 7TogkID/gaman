/**
 * @module
 * Basic Auth Middleware for Gaman.
 * Provides HTTP Basic Authentication middleware that supports both static
 * credentials and dynamic verification logic.
 */

import { next } from "../../next";
import { AppConfig, Context, Handler } from "../../types";

export type MessageFunction = (
  ctx: Context
) => string | object | Promise<string | object>;

/**
 * Options for configuring Basic Authentication middleware.
 *
 * You can use either a static username/password combination or a dynamic
 * `verifyAuth` function to validate credentials.
 */
export type BasicAuthOptions =
  | {
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
    }
  | {
      /**
       * A function to dynamically validate credentials.
       * Receives the username, password, and context.
       */
      verifyAuth: (
        username: string,
        password: string,
        c: Context
      ) => boolean | Promise<boolean>;
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
export const basicAuth = (options: BasicAuthOptions): Handler<AppConfig> => {
  // Determine if static credentials or verifyAuth function is provided
  const usernameAndPassword = "username" in options && "password" in options;
  const verifyAuth = "verifyAuth" in options;

  if (!(usernameAndPassword || verifyAuth)) {
    throw new Error(
      'basic auth middleware requires "username and password" or "verifyAuth"'
    );
  }

  // Set default realm if not provided
  if (!options.realm) {
    options.realm = "Secure Area";
  }

  /**
   * Extract credentials from the Authorization header.
   * @param headers - The headers object from the request.
   * @returns An array with [username, password], or undefined if no credentials are found.
   */
  function getCredentials(
    authHeader: string | undefined
  ): string[] | undefined {
    if (!authHeader) return undefined;
    const base64Credentials = authHeader?.split(" ")[1];
    if (!base64Credentials) return undefined;
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );
    if (!credentials) return undefined;
    return credentials.split(":");
  }

  return async (ctx) => {
    const cred = getCredentials(ctx.request.headers.get("Authorization"));

    // Validate credentials
    if (cred) {
      const [username, password] = cred;
      if (verifyAuth) {
        // Use dynamic verification
        if (await options.verifyAuth(username, password, ctx)) {
          return await next();
        }
      } else {
        // Use static credentials
        if (username === options.username && password === options.password) {
          return await next();
        }
      }
    }

    // Respond with 401 Unauthorized if authentication fails
    const status = 401;
    const headers = {
      "WWW-Authenticate":
        'Basic realm="' + options.realm?.replace(/"/g, '\\"') + '"',
    };
    const responseMsg =
      typeof options.invalidAuthMessage === "function"
        ? await options.invalidAuthMessage(ctx)
        : options.invalidAuthMessage;

    // Return response message based on the type
    return typeof responseMsg === "string"
      ? new Response(responseMsg, { status, headers })
      : Response.json(responseMsg, { status, headers });
  };
};
