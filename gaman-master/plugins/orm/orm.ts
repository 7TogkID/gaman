// orm.ts
import { GamanProvider } from './provider/base';

export class GamanORM {
	constructor(private provider: GamanProvider) {}

	async connect() {
		await this.provider.connect();
	}

	async disconnect() {
		await this.provider.disconnect();
	}

	async find<T extends object>(table: string, query?: T) {
		return this.provider.find<T>(table, query);
	}

	async findOne<T extends object>(table: string, query: T) {
		return this.provider.findOne<T>(table, query);
	}

	async insert<T extends object>(table: string, data: T) {
		return this.provider.insert<T>(table, data);
	}

	async update<T extends object>(table: string, query: T, data: Partial<T>) {
		return this.provider.update<T>(table, query, data);
	}

	async delete<T extends object>(table: string, query: T) {
		return this.provider.delete<T>(table, query);
	}
}
