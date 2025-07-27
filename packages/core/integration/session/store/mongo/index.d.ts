import type { IGamanSessionStore } from '..';
export declare class MongoDBStore implements IGamanSessionStore {
    private dbName;
    private url;
    private collName;
    private client;
    private collection;
    constructor(dbName: string, url?: string, collName?: string);
    init(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, maxAge?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
}
