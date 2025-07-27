"use strict";
var _GamanWebSocket_wss;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamanWebSocket = void 0;
const tslib_1 = require("tslib");
class GamanWebSocket {
    // @ts-ignore
    constructor(app) {
        this.app = app;
        // * <path, WebSocketServer>
        _GamanWebSocket_wss.set(this, {});
    }
    getWebSocketServer(path) {
        return tslib_1.__classPrivateFieldGet(this, _GamanWebSocket_wss, "f")[path];
    }
}
exports.GamanWebSocket = GamanWebSocket;
_GamanWebSocket_wss = new WeakMap();
