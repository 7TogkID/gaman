import { GamanORM } from '../orm.js';
export interface BaseModelOptions<T extends object> {
    table: string;
    validate?: (data: any) => T;
    casts?: Record<string, string>;
}
export declare abstract class BaseModel<T extends object> {
    protected orm: GamanORM;
    protected options: BaseModelOptions<T>;
    constructor(orm: GamanORM, options: BaseModelOptions<T>);
    protected castAttribute(key: string, value: any): any;
    protected castAttributes(data: any): T;
    create(data: any): Promise<T>;
    find(query?: Partial<T>): Promise<T[]>;
    findOne(query: Partial<T>): Promise<T | null>;
    update(query: Partial<T>, data: Partial<T>): Promise<void>;
    delete(query: Partial<T>): Promise<void>;
    hasMany<Related extends BaseModel<any>>(relatedModel: new (orm: GamanORM, options: any) => Related, foreignKey: string, localKey?: string): Related[];
    belongsTo<Related extends BaseModel<any>>(relatedModel: new (orm: GamanORM, options: any) => Related, foreignKey: string, ownerKey?: string): Related | null;
    hasOne<Related extends BaseModel<any>>(relatedModel: new (orm: GamanORM, options: any) => Related, foreignKey: string, localKey?: string): Related | null;
}
