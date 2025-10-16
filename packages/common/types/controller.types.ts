import { RequestHandler } from '@gaman/common/types/index.js';

export type ControllerFactory<
  Args extends any[] = any[]
> = (...args: Args) => Record<string, RequestHandler>;
