import { RequestHandler } from '@gaman/common/types/index.js';

export type ControllerFactory = () => Record<string, RequestHandler>; 