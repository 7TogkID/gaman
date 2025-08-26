import { GamanProvider } from './provider/base';
export declare class GamanORM {
    private provider;
    constructor(provider: GamanProvider);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    find<T extends object>(table: string, query?: T): Promise<T[]>;
    findOne<T extends object>(table: string, query: T): Promise<T | null>;
    insert<T extends object>(table: string, data: T): Promise<void>;
    update<T extends object>(table: string, query: T, data: Partial<T>): Promise<void>;
    delete<T extends object>(table: string, query: T): Promise<void>;
}
