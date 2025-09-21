import { composeWebsocketMiddleware } from '@gaman/websocket';

export default composeWebsocketMiddleware(({ message }, next) => {
	console.log(message.name);
	next();
});
