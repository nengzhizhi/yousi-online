var net = require('net');
var _ = require('lodash');

var server = net.createServer();
var connections = {};

server.on('connection', function (connection) {
	var token = Date.now().toString();
	connection.token = token;
	connections[token] = connection;
	process.send({ act: 'connect', token: token });


	connection.on('error', function (data) {
		process.send({
			act: 'close',
			token: connection.token
		})
	})
	connection.on('close', function (data) {
		process.send({
			act: 'close',
			token: connection.token
		})
	})

	connection.on('data', function (data) {
		data = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : JSON.parse(data);

		process.send({
			act: 'message',
			token: connection.token,
			data: data
		})
	})
}).listen(10002);


process.on('message', function (message) {
	if (message.cmd == 'broadcast') {
		broadcast(message.room, message.msg, message.omit);
	} else if (message.cmd == 'del') {
		if (!_.isEmpty(connections[message.token])) {
			//connections[message.token].destory();
			delete connections[message.token];
		}
	}
})

function broadcast (room, msg, omit) {
	for (var key in room) {
		if (!_.isEmpty(connections[key])) {
			if (!_.isArray(omit) || omit.indexOf(key) < 0) {
				connections[key].write(JSON.stringify(msg) + '\r\n');
			}
		}
	}
}