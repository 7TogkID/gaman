import type { Context, AppConfig, NextResponse } from './types';
import * as http from 'node:http';
import { Response } from './response';
import { Block } from './block';
import { IntegrationFactory } from './integration';
export declare class GamanApp<A extends AppConfig = any> {
    #private;
    private mainBlock;
    get blocks(): Block<A>[];
    get integrations(): {
        name: string;
        priority: import("@gaman/common/utils/priority").Priority;
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
    /**
     * Register one or more integrations into the application lifecycle.
     * Each integration will be instantiated using its factory and stored internally.
     * Executes `onLoad()` if the integration provides it.
     *
     * @param integrationFactories - A list of factory functions that return Integration objects.
     */
    registerIntegration(...integrationFactories: IntegrationFactory<A>[]): void;
    constructor(mainBlock: Block<A>);
    getBlock(blockPath: string): Block<A> | undefined;
    private registerBlocks;
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
    private checkMiddleware;
}
