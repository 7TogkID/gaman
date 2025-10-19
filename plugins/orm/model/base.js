export class BaseModel {
    constructor(orm, options) {
        this.orm = orm;
        this.options = options;
    }
    // Casting logic
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
    // CRUD operations
    async create(data) {
        if (this.options.validate) {
            data = this.options.validate(data);
        }
        await this.orm.insert(this.options.table, data);
        return this.castAttributes(data);
    }
    async find(query) {
        const results = await this.orm.find(this.options.table, query);
        return results.map(result => this.castAttributes(result));
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
    // Relation methods
    hasMany(relatedModel, foreignKey, localKey = 'id') {
        // This would need to be implemented with query builders
        // For now, return a placeholder
        return [];
    }
    belongsTo(relatedModel, foreignKey, ownerKey = 'id') {
        // Placeholder for belongsTo relation
        return null;
    }
    hasOne(relatedModel, foreignKey, localKey = 'id') {
        // Placeholder for hasOne relation
        return null;
    }
}
