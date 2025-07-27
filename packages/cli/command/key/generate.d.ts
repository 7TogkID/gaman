import { Command } from '../command';
export declare class GenerateKeyCommand extends Command {
    constructor();
    execute(args: Record<string, any>): Promise<void>;
}
declare const _default: GenerateKeyCommand;
export default _default;
