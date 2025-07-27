import type { Context, AppConfig, NextResponse } from "./types";
import * as http from "node:http";
import { Response } from "./response";
import { Block } from "./block";
import { IntegrationFactory } from "./integration";
export declare class GamanApp<A extends AppConfig = any> {
    #private;
    get blocks(): Block<A>[];
    get integrations(): {
        name: string;
        priority: import("./types").Priority;
        onLoad?: () => void;
        onDisabled?: () => void;
        onRequest?: ((ctx: Context<A>) => NextResponse) | undefined;
        onResponse?: ((ctx: Context<A>, res: Response) => Promise<Response> | Response) | undefined;
    }[];
    get server(): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | null;
    get strict(): boolean;
    /**
     * must use slash '/' at the end of the path
     * @example '/user/detail/'
     * @default true
     */
    setStrict(v?: boolean): void;
    registerIntegration(integrationFactory: IntegrationFactory<A>): void;
    constructor(mainBlock: Block<A>);
    getBlock(blockPath: string): Block<A> | undefined;
    private registerBlock;
    private requestHandle;
    private handleRoutes;
    private handleResponse;
    listen(port: number | undefined, host: string | undefined, cb: () => any): void;
    close(): Promise<void>;
    /**
     * Checks if a string is a valid HTTP method
     * @param method - String to check
     * @returns True if the string is a valid HTTP method
     */
    private isHttpMethod;
    private createParamRegex;
    checkMiddleware(pathMiddleware: string, pathRequestClient: string): boolean;
}
