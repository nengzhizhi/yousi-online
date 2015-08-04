var http = require('http');
var WebSocketServer = require('websocket').server;
var _ = require('lodash');

var connections = {};

httpServer = http.createServer(function (request) {
	response.end();
}).listen(10001);

wsServer = new WebSocketServer({
	httpServer: httpServer,
	autoAcceptConnections: false
})

wsServer.on('request', function (request) {
	var connection = request.accept('echo-protocol', request.origin);
	var token = Date.now().toString();
	connection.token = token;
	connections[token] = connection;
	process.send({ act: 'connect', token: token})

	connection.on('close', function (reasonCode, description) {
		process.send({
			act: 'close',
			token: connection.token
		})
	})

	connection.on('message', function (message) {
		process.send({
			act: 'message',
			token: connection.token,
			data: JSON.parse(message.utf8Data)
		})
	})
})

process.on('message', function (message) {
	if (message.cmd == 'broadcast') {
		broadcast(message.room, message.msg, message.omit);
	}
})

function broadcast(room, msg, omit) {
	console.log(msg);
	for (var key in room) {
		if (!_.isEmpty(connections[key])) {
			if (!_.isArray(omit) || omit.indexOf(key) < 0) {
				connections[key].sendUTF(JSON.stringify(msg));
			}
		}
	}	
}