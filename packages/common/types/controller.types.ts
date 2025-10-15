import { RequestHandler } from '@gaman/common/types/index.js';

export type ControllerFactory = (
	...args: any[]
) => Record<string, RequestHandler>;
