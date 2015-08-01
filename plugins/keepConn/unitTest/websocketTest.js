var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();



client.on('connect', function (connection) {
	connection.on('message', function (message) {
		var msg = JSON.parse(message.utf8Data);

	})

	connection.send({c: 'join', data: {
		roomId: 'xxxx',
		username: 'nengzhizhi'
	}});
})

client.connect('ws://localhost:10001', 'echo-protocol');