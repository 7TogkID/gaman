/**
 * @fileoverview Base model class for ORM operations with casting and relations.
 */
import { GamanORM } from '../orm.js';
/**
 * Options for configuring a BaseModel instance.
 * @template T The type of the model data.
 */
export interface BaseModelOptions<T extends object> {
    table: string;
    validate?: (data: any) => T;
    casts?: Record<string, string>;
}
/**
 * Interface for a model constructor that includes static options.
 * @template T The type of the model data.
 */
export interface ModelConstructor<T extends object> {
    new (orm: GamanORM, options: BaseModelOptions<T>): BaseModel<T>;
    options: BaseModelOptions<T>;
}
/**
 * Interface for a model constructor that includes a static getOptions method.
 * @template T The type of the model data.
 */
export interface ModelConstructorWithGetOptions<T extends object> {
    new (orm: GamanORM, options: BaseModelOptions<T>): BaseModel<T>;
    getOptions(): BaseModelOptions<T>;
}
/**
 * Abstract base class for database models in the Gaman ORM.
 * Provides CRUD operations, data casting, and relation methods.
 *
 * @template T The type of the object this model represents.
 */
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
    /**
     * Defines a hasMany relation.
     */
    hasMany<RelatedData extends object>(relatedOptions: BaseModelOptions<RelatedData>, relatedModel: new (orm: GamanORM, options: BaseModelOptions<RelatedData>) => BaseModel<RelatedData>, foreignKey: string, localKey?: string, localKeyValue?: any): Promise<RelatedData[]>;
    /**
     * Defines a belongsTo relation.
     */
    belongsTo<RelatedData extends object>(relatedOptions: BaseModelOptions<RelatedData>, relatedModel: new (orm: GamanORM, options: BaseModelOptions<RelatedData>) => BaseModel<RelatedData>, foreignKey: string, ownerKey?: string, foreignKeyValue?: any): Promise<RelatedData | null>;
    /**
     * Defines a hasOne relation.
     */
    hasOne<RelatedData extends object>(relatedOptions: BaseModelOptions<RelatedData>, relatedModel: new (orm: GamanORM, options: BaseModelOptions<RelatedData>) => BaseModel<RelatedData>, foreignKey: string, localKey?: string, localKeyValue?: any): Promise<RelatedData | null>;
}
