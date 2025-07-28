import { Command } from '../command';
declare class MakeService extends Command {
    constructor();
    execute(args: Record<string, any>): Promise<void>;
}
declare const _default: MakeService;
export default _default;
