import { Response } from '@gaman/core/response';
import { Logger } from '@gaman/common/utils/logger';

globalThis.Res = Response;
globalThis.Log = Logger;

declare global {
	var Res: typeof import('@gaman/core/response').Response;
	var Log: typeof import('@gaman/common/utils/logger').Logger;

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
