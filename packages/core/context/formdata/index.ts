import { File } from '@gaman/core/context/formdata/file';

/**
 * * ini untuk schema buat inputan aja kek buat sistem gaman ngeset data form
 * * contoh: form.set(key, {value}); biar enak
 * * nanti ujung ujungnya tetep jadi class FormDataEntryValue
 */
export interface IFormDataEntryValue {
	name: string;
	value: string | File | undefined;
}

/**
 * * Data Real
 */
export class FormDataEntryValue implements IFormDataEntryValue {
	constructor(
		public name: string,
		public value: string | File | undefined,
	) {}
	public getName(): string {
		return this.name;
	}

	public isFile(): this is File {
		return this.value instanceof File;
	}

	public toString(): string {
		if (typeof this.value === 'string') return this.value;
		if (typeof this.value === 'number') return String(this.value);
		return '[object File]';
	}

	[Symbol.toPrimitive](hint: string) {
		if (hint === 'string') return this.toString();
		if (hint === 'number') return Number(this.value);
		return this.toString();
	}

	public asString(): string {
		if (typeof this.value === 'string') return this.value;
		return '';
	}

	public asFile(): File | undefined {
		if (this.value instanceof File) return this.value;
		return undefined;
	}

	public asNumber(): number {
		if (typeof this.value == 'number') return this.value;
		return Number(this.value);
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
		const _newValue = new FormDataEntryValue(value.name, value.value);
		if (this.has(name)) {
			const values = this.fields.get(name)!;
			values.push(_newValue);
		} else {
			this.fields.set(name, [_newValue]);
		}
	}

	setAll(name: string, values: IFormDataEntryValue[]) {
		const _newValues: FormDataEntryValue[] = values.map(
			(value) => new FormDataEntryValue(value.name, value.value),
		);
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
