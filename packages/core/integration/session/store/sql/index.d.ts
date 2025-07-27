import type { IGamanSessionStore } from '..';
export declare class SQLStore implements IGamanSessionStore {
    private file;
    private db;
    constructor(file?: string);
    init(): Promise<void>;
    get(key: string): Promise<any>;
    set(key: string, value: string, maxAge?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
}
