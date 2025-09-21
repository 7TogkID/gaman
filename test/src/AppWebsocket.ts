import { composeWebsocket } from '@gaman/websocket';

export default composeWebsocket((event) => {
	event.send('selamat datang: ' + event.clientId);

	event.onMessage((msg) => {
		if(typeof msg === 'string' && msg.startsWith('/broadcast')){
			event.send('Broadcast cuy: ' + msg.split(' ').slice(1))
		}

		event.send(msg)
	})
});
