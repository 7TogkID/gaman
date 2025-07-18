/**
 * * ini untuk schema buat inputan aja kek buat sistem gaman ngeset data form
 * * contoh: form.set(key, {value}); biar enak
 * * nanti ujung ujungnya tetep jadi class FormDataEntryValue
 */
export interface IFormDataEntryValue {
  filename?: string;
  mimetype?: string;
  name: string;
  value: string | Blob;
}

/**
 * * Data Real
 */
export class FormDataEntryValue implements IFormDataEntryValue {
  constructor(
    public name: string,
    public value: string | Blob,
    public filename?: string,
    public mimetype?: string
  ) {}
  public getName(): string {
    return this.name;
  }
  public isFile(): boolean {
    return this.value instanceof Blob;
  }

  public getFilename(): string | undefined {
    return this.filename;
  }

  public getMimetype(): string | undefined {
    return this.mimetype;
  }

  public toString(): string {
    return typeof this.value === "string" ? this.value : "[object File]";
  }

  public valueOf(): string {
    return this.toString();
  }

  public asString(): string | undefined {
    if (typeof this.value === "string") return this.value;
    return undefined;
  }

  public asFile(): Blob | undefined {
    if (this.value instanceof Blob) return this.value;
    return undefined;
  }
}

export class FormData {
  private fields: Map<string, FormDataEntryValue[]> = new Map();

  delete(name: string): void {
    this.fields.delete(name);
  }

  get(name: string): FormDataEntryValue | null {
    const values = this.fields.get(name);
    return values ? values[0] || null : null;
  }

  getAll(name: string): FormDataEntryValue[] {
    return this.fields.get(name) || [];
  }

  has(name: string): boolean {
    return this.fields.has(name);
  }

  set(name: string, value: IFormDataEntryValue) {
    const _newValue = new FormDataEntryValue(
      value.name,
      value.value,
      value.filename,
      value.mimetype
    );
    if (this.has(name)) {
      const values = this.fields.get(name)!;
      this.fields.set(name, [...values, _newValue]);
    }
    this.fields.set(name, [_newValue]);
  }

  setAll(name: string, values: IFormDataEntryValue[]) {
    const _newValues: FormDataEntryValue[] = [];
    for (const value of values) {
      _newValues.push(
        new FormDataEntryValue(
          value.name,
          value.value,
          value.filename,
          value.mimetype
        )
      );
    }
    if (this.has(name)) {
      const _values = this.fields.get(name)!;
      this.fields.set(name, [..._values, ..._newValues]);
    }
    this.fields.set(name, _newValues);
  }

  entries(): IterableIterator<[string, FormDataEntryValue]> {
    const flattenedEntries: [string, FormDataEntryValue][] = [];
    for (const [name, values] of this.fields.entries()) {
      values.forEach((value) => flattenedEntries.push([name, value]));
    }
    return flattenedEntries[Symbol.iterator]();
  }

  keys(): IterableIterator<string> {
    return this.fields.keys();
  }

  values(): IterableIterator<FormDataEntryValue> {
    const flattenedValues: FormDataEntryValue[] = [];
    for (const values of this.fields.values()) {
      flattenedValues.push(...values);
    }
    return flattenedValues[Symbol.iterator]();
  }
}
