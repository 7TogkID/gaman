import { insertAndSort } from './middleware-data.js';
import { Priority } from '../enums/priority.enum.js';
import { WebsocketMiddleware } from '../types/websocket.types.js';

const middlewares: WebsocketMiddleware[] = [];

const monitorMiddlewares: WebsocketMiddleware[] = [];

function registerMiddleware(mw: WebsocketMiddleware) {
	if (mw.config?.priority === Priority.MONITOR) {
		monitorMiddlewares.push(mw);
	} else {
		insertAndSort(
			middlewares,
			mw,
			(v) => v.config?.priority || Priority.NORMAL,
		);
	}
}

function allMiddlewares(): WebsocketMiddleware[] {
	return middlewares;
}
function allMonitorMiddlewares(): WebsocketMiddleware[] {
	return monitorMiddlewares;
}

export default {
	registerMiddleware,
	allMiddlewares,
	allMonitorMiddlewares,
};
