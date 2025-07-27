import { Command } from "../command";
declare class MakeBlock extends Command {
    constructor();
    execute(args: Record<string, any>): Promise<void>;
}
declare const _default: MakeBlock;
export default _default;
