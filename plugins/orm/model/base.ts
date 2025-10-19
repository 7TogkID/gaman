import { GamanORM } from '../orm.js';

export interface BaseModelOptions<T extends object> {
	table: string;
	validate?: (data: any) => T;
	casts?: Record<string, string>;
}

export abstract class BaseModel<T extends object> {
	protected orm: GamanORM;
	protected options: BaseModelOptions<T>;

	constructor(orm: GamanORM, options: BaseModelOptions<T>) {
		this.orm = orm;
		this.options = options;
	}

	// Casting logic
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

	// CRUD operations
	async create(data: any): Promise<T> {
		if (this.options.validate) {
			data = this.options.validate(data);
		}
		await this.orm.insert(this.options.table, data);
		return this.castAttributes(data) as T;
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

	// Relation methods
	hasMany<Related extends BaseModel<any>>(
		relatedModel: new (orm: GamanORM, options: any) => Related,
		foreignKey: string,
		localKey: string = 'id',
	): Related[] {
		// This would need to be implemented with query builders
		// For now, return a placeholder
		return [];
	}

	belongsTo<Related extends BaseModel<any>>(
		relatedModel: new (orm: GamanORM, options: any) => Related,
		foreignKey: string,
		ownerKey: string = 'id',
	): Related | null {
		// Placeholder for belongsTo relation
		return null;
	}

	hasOne<Related extends BaseModel<any>>(
		relatedModel: new (orm: GamanORM, options: any) => Related,
		foreignKey: string,
		localKey: string = 'id',
	): Related | null {
		// Placeholder for hasOne relation
		return null;
	}
}
