import { Command } from "../command";
declare class MakeIntegration extends Command {
    constructor();
    execute(args: Record<string, any>): Promise<void>;
}
declare const _default: MakeIntegration;
export default _default;
