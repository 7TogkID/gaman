export class Command {
    constructor(name, description, usage, alias = []) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.alias = alias;
    }
}
