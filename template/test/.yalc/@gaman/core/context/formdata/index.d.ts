import { File } from './file';
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
export declare class FormDataEntryValue implements IFormDataEntryValue {
    name: string;
    value: string | File | undefined;
    constructor(name: string, value: string | File | undefined);
    getName(): string;
    isFile(): this is File;
    toString(): string;
    [Symbol.toPrimitive](hint: string): string | number;
    asString(): string;
    asFile(): File | undefined;
    asNumber(): number;
}
export declare class FormData {
    private fields;
    delete(name: string): void;
    get(name: string): FormDataEntryValue | null;
    getAll(name: string): FormDataEntryValue[];
    has(name: string): boolean;
    set(name: string, value: IFormDataEntryValue): void;
    setAll(name: string, values: IFormDataEntryValue[]): void;
    entries(): IterableIterator<[string, FormDataEntryValue]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<FormDataEntryValue>;
}
