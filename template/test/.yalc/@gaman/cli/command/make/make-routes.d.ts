import { Command } from '../command';
declare class MakeRoutes extends Command {
    constructor();
    execute(args: Record<string, any>): Promise<void>;
}
declare const _default: MakeRoutes;
export default _default;
