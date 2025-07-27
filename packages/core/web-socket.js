var _GamanWebSocket_wss;
import { __classPrivateFieldGet } from "tslib";
export class GamanWebSocket {
    // @ts-ignore
    constructor(app) {
        this.app = app;
        // * <path, WebSocketServer>
        _GamanWebSocket_wss.set(this, {});
    }
    getWebSocketServer(path) {
        return __classPrivateFieldGet(this, _GamanWebSocket_wss, "f")[path];
    }
}
_GamanWebSocket_wss = new WeakMap();
