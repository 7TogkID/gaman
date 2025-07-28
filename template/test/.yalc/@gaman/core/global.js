import { Response } from './response';
import { next } from './next';
import { Logger } from '@gaman/common/utils/logger';
globalThis.Res = Response;
globalThis.r = Response;
globalThis.next = next;
globalThis.Log = Logger;
globalThis.Logger = Logger;
