import { Args } from "@gaman/common/index.js";

export abstract class Command {
  constructor(
    public name: string,
    public description: string,
    public usage: string,
    public alias: string[] = []
  ) {}

  abstract execute(args: Args): Promise<void>;
}
