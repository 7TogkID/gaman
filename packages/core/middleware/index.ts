import type { AppConfig, Handler } from "../types";

export function defineMiddleware<A extends AppConfig = AppConfig>(
  handler: Handler<A>
): Handler<A> {
  return handler;
}