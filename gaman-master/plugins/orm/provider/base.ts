export interface GamanProvider {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	find<T extends object>(collection: string, query?: object): Promise<T[]>;
	findOne<T extends object>(
		collection: string,
		query: object,
	): Promise<T | null>;
	insert<T extends object>(collection: string, data: T): Promise<void>;
	update<T extends object>(
		collection: string,
		query: object,
		data: Partial<T>,
	): Promise<void>;
	delete<T extends object>(collection: string, query: object): Promise<void>;
}
