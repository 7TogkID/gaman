import { Database } from 'sqlite';
import { GamanProvider } from './base.js';
export declare class SQLiteProvider implements GamanProvider {
    db: Database;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    find<T>(table: string, query?: object): Promise<T[]>;
    findOne<T>(table: string, query: object): Promise<T | null>;
    insert<T extends object>(table: string, data: T): Promise<void>;
    update<T>(table: string, query: object, data: Partial<T>): Promise<void>;
    delete<T>(table: string, query: object): Promise<void>;
}
