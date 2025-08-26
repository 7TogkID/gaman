import { RequestHandler } from '@gaman/common/types';

export type ControllerFactory = () => Record<string, RequestHandler>;