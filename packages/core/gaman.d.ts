import { Block } from "./block";
import { GamanApp } from "./gaman-app";
import type { AppConfig } from "./types";
export declare function defineBootstrap<A extends AppConfig>(mainBlock: Block<A>, cb: (app: GamanApp<A>) => any): Promise<undefined>;
