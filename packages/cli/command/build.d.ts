import { Command } from './command';
export declare function runBuild(): Promise<void>;
export declare class BuildCommand extends Command {
    constructor();
    execute(): Promise<void>;
}
declare const _default: BuildCommand;
export default _default;
