import { SerializeOptions } from 'cookie';
import { Request } from '../../types';
export interface GamanCookieInterface {
    value: string;
    json(reviver?: (key: string, value: any) => any): Record<string, any>;
    number(radix?: number): number;
    boolean(): boolean;
}
export interface GamanCookieSetOptions extends Pick<SerializeOptions, 'domain' | 'path' | 'maxAge' | 'httpOnly' | 'sameSite' | 'secure' | 'encode'> {
    expires?: Date | string | number;
}
export interface GamanCookieGetOptions {
    decode?: (value: string) => string;
}
export type GamanCookieDeleteOptions = Omit<GamanCookieSetOptions, 'expires' | 'maxAge' | 'encode'>;
export interface GamanCookiesInterface {
    get(key: string): GamanCookie | undefined;
    has(key: string): boolean;
    set(key: string, value: string | number | boolean | Record<string, any>, options?: GamanCookieSetOptions): void;
    delete(key: string, options?: GamanCookieDeleteOptions): void;
}
export declare class GamanCookie implements GamanCookieInterface {
    value: string;
    constructor(value: string);
    json(reviver?: (key: string, value: any) => any): Record<string, any>;
    number(radix?: number): number;
    boolean(): boolean;
}
export declare class GamanCookies implements GamanCookiesInterface {
    #private;
    constructor(request: Request);
    get(key: string, options?: GamanCookieGetOptions | undefined): GamanCookie | undefined;
    has(key: string): boolean;
    set(key: string, value: string | number | boolean | Record<string, any>, options?: GamanCookieSetOptions): void;
    delete(key: string, options?: GamanCookieDeleteOptions): void;
    merge(cookies: GamanCookies): void;
    headers(): Generator<string, void, unknown>;
    static consume(cookies: GamanCookies): Generator<string, void, unknown>;
}
