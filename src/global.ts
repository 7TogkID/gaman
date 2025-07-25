import { Response } from "./response";
import { next } from "./next";
import { Logger } from "./utils";

globalThis.Res = Response;
globalThis.r = Response;
globalThis.next = next;
globalThis.Log = Logger;
globalThis.Logger = Log;

declare global {
  var Res: typeof import("./response").Response;
  var r: typeof import("./response").Response;
  var next: typeof import("./next").next;
  var Log: typeof import("./utils/logger").Log;
  var Logger: typeof import("./utils/logger").Logger;

  namespace Gaman {
    interface Locals {}
    interface Env {}
  }
}

export {};
