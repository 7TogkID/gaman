import { GamanApp } from '../../gaman-app';
import { Request } from '../../types';
import { GamanCookies } from '../cookies';
export interface IGamanSession {
    set(name: string, payload: string | object | Buffer): Promise<void>;
    get<T = any>(name: string): Promise<T | null>;
    has(name: string): Promise<boolean>;
    delete(name: string): Promise<void>;
}
export declare class GamanSession implements IGamanSession {
    #private;
    constructor(app: GamanApp, cookies: GamanCookies, request: Request);
    set(name: string, payload: string | object | Buffer): Promise<void>;
    get<T = any>(name: string): Promise<T | null>;
    has(name: string): Promise<boolean>;
    delete(name: string): Promise<void>;
}
