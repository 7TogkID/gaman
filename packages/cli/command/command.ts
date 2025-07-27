export abstract class Command {
  constructor(
    public name: string,
    public description: string,
    public usage: string,
    public alias: string[] = []
  ) {}

  abstract execute(args: Record<string, any>): Promise<void>;
}
