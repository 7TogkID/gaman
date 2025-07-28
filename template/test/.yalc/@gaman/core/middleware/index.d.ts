import type { AppConfig, Handler } from "../types";
export declare function defineMiddleware<A extends AppConfig>(handler: Handler<A>): Handler<A>;
