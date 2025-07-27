import type { IGamanSessionStore } from '..';
export declare class MemoryStore implements IGamanSessionStore {
    private store;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, maxAge?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
}
