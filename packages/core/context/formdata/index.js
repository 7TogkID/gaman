"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormData = exports.FormDataEntryValue = void 0;
const file_1 = require("./file");
/**
 * * Data Real
 */
class FormDataEntryValue {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    getName() {
        return this.name;
    }
    isFile() {
        return this.value instanceof file_1.File;
    }
    toString() {
        if (typeof this.value === 'string')
            return this.value;
        if (typeof this.value === 'number')
            return String(this.value);
        return '[object File]';
    }
    [Symbol.toPrimitive](hint) {
        if (hint === 'string')
            return this.toString();
        if (hint === 'number')
            return Number(this.value);
        return this.toString();
    }
    asString() {
        if (typeof this.value === 'string')
            return this.value;
        return '';
    }
    asFile() {
        if (this.value instanceof file_1.File)
            return this.value;
        return undefined;
    }
    asNumber() {
        if (typeof this.value == 'number')
            return this.value;
        return Number(this.value);
    }
}
exports.FormDataEntryValue = FormDataEntryValue;
class FormData {
    constructor() {
        this.fields = new Map();
    }
    delete(name) {
        this.fields.delete(name);
    }
    get(name) {
        const values = this.fields.get(name);
        return values ? values[0] || null : null;
    }
    getAll(name) {
        return this.fields.get(name) || [];
    }
    has(name) {
        return this.fields.has(name);
    }
    set(name, value) {
        const _newValue = new FormDataEntryValue(value.name, value.value);
        if (this.has(name)) {
            const values = this.fields.get(name);
            values.push(_newValue);
        }
        else {
            this.fields.set(name, [_newValue]);
        }
    }
    setAll(name, values) {
        const _newValues = values.map((value) => new FormDataEntryValue(value.name, value.value));
        this.fields.set(name, _newValues);
    }
    entries() {
        const flattenedEntries = [];
        for (const [name, values] of this.fields.entries()) {
            values.forEach((value) => flattenedEntries.push([name, value]));
        }
        return flattenedEntries[Symbol.iterator]();
    }
    keys() {
        return this.fields.keys();
    }
    values() {
        const flattenedValues = [];
        for (const values of this.fields.values()) {
            flattenedValues.push(...values);
        }
        return flattenedValues[Symbol.iterator]();
    }
}
exports.FormData = FormData;
