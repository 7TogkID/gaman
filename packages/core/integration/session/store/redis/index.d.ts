import type { IGamanSessionStore } from '..';
export declare class RedisStore implements IGamanSessionStore {
    private client;
    constructor(redisUrl?: string);
    get(key: string): Promise<any>;
    set(key: string, value: string, maxAge?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
}
