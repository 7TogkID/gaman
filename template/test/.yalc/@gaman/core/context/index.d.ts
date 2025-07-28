import * as http from 'node:http';
import type { Context, AppConfig } from '../types';
import { GamanApp } from '../gaman-app';
export declare function createContext<A extends AppConfig>(_app: GamanApp<A>, req: http.IncomingMessage, res: http.ServerResponse): Promise<Context<A>>;
