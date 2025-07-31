import { Response } from './response';
import { next } from './next';
import { Logger } from '@gaman/common/utils/logger';

globalThis.Res = Response;
globalThis.r = Response;
globalThis.next = next;
globalThis.Log = Logger;
globalThis.Logger = Logger;

declare global {
	var Res: typeof import('./response').Response;
	var r: typeof import('./response').Response;
	var next: typeof import('./next').next;
	var Log: typeof import('@gaman/common/utils/logger').Logger;
	var Logger: typeof import('@gaman/common/utils/logger').Logger;

	namespace NodeJS {
		interface ProcessEnv extends Gaman.Env {}
	}

	namespace Gaman {
		interface Locals {}
		interface Env {
			NODE_ENV?: 'development' | 'production';
			PORT?: number;
			HOST?: string;
		}
		interface Context {
			
		}
	}
}

export {};
