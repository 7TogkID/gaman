/**
 * @fileoverview Base model class for ORM operations with casting and relations.
 */
/**
 * Abstract base class for database models in the Gaman ORM.
 * Provides CRUD operations, data casting, and relation methods.
 *
 * @template T The type of the object this model represents.
 */
export class BaseModel {
    constructor(orm, options) {
        this.orm = orm;
        this.options = options;
    }
    castAttribute(key, value) {
        const cast = this.options.casts?.[key];
        if (!cast)
            return value;
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
    castAttributes(data) {
        const casted = {};
        for (const [key, value] of Object.entries(data)) {
            casted[key] = this.castAttribute(key, value);
        }
        return casted;
    }
    async create(data) {
        if (this.options.validate) {
            data = this.options.validate(data);
        }
        await this.orm.insert(this.options.table, data);
        return this.castAttributes(data);
    }
    async find(query) {
        const results = await this.orm.find(this.options.table, query);
        return results.map((result) => this.castAttributes(result));
    }
    async findOne(query) {
        const result = await this.orm.findOne(this.options.table, query);
        return result ? this.castAttributes(result) : null;
    }
    async update(query, data) {
        if (this.options.validate) {
            data = this.options.validate(data);
        }
        await this.orm.update(this.options.table, query, data);
    }
    async delete(query) {
        await this.orm.delete(this.options.table, query);
    }
    /**
     * Defines a hasMany relation.
     */
    async hasMany(relatedOptions, relatedModel, foreignKey, localKey = 'id', localKeyValue) {
        if (localKeyValue === undefined) {
            throw new Error('localKeyValue is required for hasMany relation');
        }
        const query = { [foreignKey]: localKeyValue };
        const results = await this.orm.find(relatedOptions.table, query);
        const relatedInstance = new relatedModel(this.orm, relatedOptions);
        return results.map((result) => relatedInstance.castAttributes(result));
    }
    /**
     * Defines a belongsTo relation.
     */
    async belongsTo(relatedOptions, relatedModel, foreignKey, ownerKey = 'id', foreignKeyValue) {
        if (foreignKeyValue === undefined) {
            throw new Error('foreignKeyValue is required for belongsTo relation');
        }
        const query = { [ownerKey]: foreignKeyValue };
        const result = await this.orm.findOne(relatedOptions.table, query);
        if (result) {
            const relatedInstance = new relatedModel(this.orm, relatedOptions);
            return relatedInstance.castAttributes(result);
        }
        return null;
    }
    /**
     * Defines a hasOne relation.
     */
    async hasOne(relatedOptions, relatedModel, foreignKey, localKey = 'id', localKeyValue) {
        if (localKeyValue === undefined) {
            throw new Error('localKeyValue is required for hasOne relation');
        }
        const query = { [foreignKey]: localKeyValue };
        const result = await this.orm.findOne(relatedOptions.table, query);
        if (result) {
            const relatedInstance = new relatedModel(this.orm, relatedOptions);
            return relatedInstance.castAttributes(result);
        }
        return null;
    }
}
