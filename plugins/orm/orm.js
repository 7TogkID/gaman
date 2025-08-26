export class GamanORM {
    constructor(provider) {
        this.provider = provider;
    }
    async connect() {
        await this.provider.connect();
    }
    async disconnect() {
        await this.provider.disconnect();
    }
    async find(table, query) {
        return this.provider.find(table, query);
    }
    async findOne(table, query) {
        return this.provider.findOne(table, query);
    }
    async insert(table, data) {
        return this.provider.insert(table, data);
    }
    async update(table, query, data) {
        return this.provider.update(table, query, data);
    }
    async delete(table, query) {
        return this.provider.delete(table, query);
    }
}
