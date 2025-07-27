"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    constructor(name, description, usage, alias = []) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.alias = alias;
    }
}
exports.Command = Command;
