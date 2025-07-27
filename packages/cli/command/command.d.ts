export declare abstract class Command {
    name: string;
    description: string;
    usage: string;
    alias: string[];
    constructor(name: string, description: string, usage: string, alias?: string[]);
    abstract execute(args: Record<string, any>): Promise<void>;
}
