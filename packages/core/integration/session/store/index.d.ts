export interface IGamanSessionStore {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, maxAge?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
}
