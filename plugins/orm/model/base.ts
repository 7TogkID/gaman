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
export abstract class BaseModel<T extends object> {
	protected orm: GamanORM;
	protected options: BaseModelOptions<T>;

	constructor(orm: GamanORM, options: BaseModelOptions<T>) {
		this.orm = orm;
		this.options = options;
	}

	protected castAttribute(key: string, value: any): any {
		const cast = this.options.casts?.[key];
		if (!cast) return value;

		switch (cast) {
			case 'int':
			case 'integer':
				return parseInt(value, 10);
			case 'float':
			case 'double':
				return parseFloat(value);
			case 'string':
				return String(value);
			case 'bool':
			case 'boolean':
				return Boolean(value);
			case 'json':
				return typeof value === 'string' ? JSON.parse(value) : value;
			case 'datetime':
				return new Date(value);
			default:
				return value;
		}
	}

	protected castAttributes(data: any): T {
		const casted: any = {};
		for (const [key, value] of Object.entries(data)) {
			casted[key] = this.castAttribute(key, value);
		}
		return casted as T;
	}

	async create(data: any): Promise<T> {
		if (this.options.validate) {
			data = this.options.validate(data);
		}
		await this.orm.insert(this.options.table, data);
		return this.castAttributes(data);
	}

	async find(query?: Partial<T>): Promise<T[]> {
		const results = await this.orm.find<T>(this.options.table, query as T);
		return results.map((result) => this.castAttributes(result));
	}

	async findOne(query: Partial<T>): Promise<T | null> {
		const result = await this.orm.findOne<T>(this.options.table, query as T);
		return result ? this.castAttributes(result) : null;
	}

	async update(query: Partial<T>, data: Partial<T>): Promise<void> {
		if (this.options.validate) {
			data = this.options.validate(data);
		}
		await this.orm.update(this.options.table, query, data);
	}

	async delete(query: Partial<T>): Promise<void> {
		await this.orm.delete(this.options.table, query);
	}

	/**
	 * Defines a hasMany relation.
	 */
	async hasMany<RelatedData extends object>(
		relatedOptions: BaseModelOptions<RelatedData>,
		relatedModel: new (
			orm: GamanORM,
			options: BaseModelOptions<RelatedData>,
		) => BaseModel<RelatedData>,
		foreignKey: string,
		localKey = 'id',
		localKeyValue?: any,
	): Promise<RelatedData[]> {
		if (localKeyValue === undefined) {
			throw new Error('localKeyValue is required for hasMany relation');
		}
		const query = { [foreignKey]: localKeyValue } as any;
		const results = await this.orm.find<RelatedData>(
			relatedOptions.table,
			query,
		);
		const relatedInstance = new relatedModel(this.orm, relatedOptions);
		return results.map((result) => relatedInstance.castAttributes(result));
	}

	/**
	 * Defines a belongsTo relation.
	 */
	async belongsTo<RelatedData extends object>(
		relatedOptions: BaseModelOptions<RelatedData>,
		relatedModel: new (
			orm: GamanORM,
			options: BaseModelOptions<RelatedData>,
		) => BaseModel<RelatedData>,
		foreignKey: string,
		ownerKey = 'id',
		foreignKeyValue?: any,
	): Promise<RelatedData | null> {
		if (foreignKeyValue === undefined) {
			throw new Error('foreignKeyValue is required for belongsTo relation');
		}
		const query = { [ownerKey]: foreignKeyValue } as any;
		const result = await this.orm.findOne<RelatedData>(
			relatedOptions.table,
			query,
		);
		if (result) {
			const relatedInstance = new relatedModel(this.orm, relatedOptions);
			return relatedInstance.castAttributes(result);
		}
		return null;
	}

	/**
	 * Defines a hasOne relation.
	 */
	async hasOne<RelatedData extends object>(
		relatedOptions: BaseModelOptions<RelatedData>,
		relatedModel: new (
			orm: GamanORM,
			options: BaseModelOptions<RelatedData>,
		) => BaseModel<RelatedData>,
		foreignKey: string,
		localKey = 'id',
		localKeyValue?: any,
	): Promise<RelatedData | null> {
		if (localKeyValue === undefined) {
			throw new Error('localKeyValue is required for hasOne relation');
		}
		const query = { [foreignKey]: localKeyValue } as any;
		const result = await this.orm.findOne<RelatedData>(
			relatedOptions.table,
			query,
		);
		if (result) {
			const relatedInstance = new relatedModel(this.orm, relatedOptions);
			return relatedInstance.castAttributes(result);
		}
		return null;
	}
}
