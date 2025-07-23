import { Response } from './response';
import { next } from './next';

globalThis.Res = Response;
globalThis.r = Response;
globalThis.next = next;

declare global {
	var Res: typeof import('./response').Response;
	var r: typeof import('./response').Response;
	var next: typeof import('./next').next;

	namespace Gaman {
		interface Locals {}
		interface Env {}
	}
}

export {};
