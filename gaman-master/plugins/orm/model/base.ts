export interface BaseModelOptions<T extends object> {
  table: string;
  validate?: (data: any) => T; // Optional validator buatan sendiri
}

export interface BaseModel<T extends object> {
  table: string;
  validate?: (data: any) => T;

  create(data: any): Promise<T>;
  find(query?: Partial<T>): Promise<T[]>;
  findOne(query: Partial<T>): Promise<T | null>;
  update(query: Partial<T>, data: Partial<T>): Promise<void>;
  delete(query: Partial<T>): Promise<void>;
}
