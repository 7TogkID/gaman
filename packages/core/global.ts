import { Response } from '@gaman/core/response.js';
import { Logger } from '@gaman/common/utils/logger.js';

globalThis.Res = Response;
globalThis.Log = Logger;

declare global {
	var Res: typeof import('@gaman/core/response.js').Response;
	var Log: typeof import('@gaman/common/utils/logger.js').Logger;

	namespace NodeJS {
		interface ProcessEnv extends Gaman.Env {}
	}

	namespace Gaman {
		interface Locals {}
		interface Env {
			NODE_ENV?: 'development' | 'production';
			PORT?: any;
			HOST?: string;
		}
		interface Context {
			
		}
	}
}

export {};
