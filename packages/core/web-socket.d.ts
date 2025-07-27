import type { GamanApp } from "./gaman-app";
import type { AppConfig } from "./types";
import { WebSocketServer } from "ws";
export declare class GamanWebSocket<A extends AppConfig> {
    #private;
    private app;
    constructor(app: GamanApp<A>);
    getWebSocketServer(path: string): WebSocketServer | undefined;
}
