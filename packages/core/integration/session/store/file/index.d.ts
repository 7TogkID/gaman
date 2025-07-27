import type { IGamanSessionStore } from '..';
export declare class FileStore implements IGamanSessionStore {
    private dir;
    constructor(dir?: string);
    private getFilePath;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, maxAge?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
}
