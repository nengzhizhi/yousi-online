var net = require('net');
var _ = require('lodash');

var server = net.createServer();
var stConnections = {};
var connectionBuff = {};

server.on('connection', function (connection) {
	connection.token = Date.now();
	connectionBuff[connection.token] = connection;
	process.send({  act: 'connection',
					connection: { token: connection.token, type: 'st' }});

	connection.on('error', function(){
		// process.send({ 	act: 'close',
		// 				data: { roomId: connection.roomId, username: connection.username },			
		// 			  	connection: { token: connection.token, type: 'st' }});
	})

	connection.on('end', function(){
		console.log('end');
	})

	connection.on('close', function(){
		process.send({	act: 'close',
						data: { roomId: connection.roomId, username: connection.username },			
						connection: { token: connection.token, type: 'st' }});		
	})

	connection.on('data', function (data) {
		data = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : JSON.parse(data);
		process.send({  act: 'data',
						connection: { token: connection.token, type: 'st' },
						data: data });
	})
}).listen(10002);

process.on('message', function (message) {
	console.log(message);
	if (message.cmd == 'broadcast') {
		broadcast(message.data.roomId, message.data.message);
	} else if (message.cmd == 'add') {
		connectionBuff[message.data.connection.token].roomId 
											= message.data.connection.roomId;
		connectionBuff[message.data.connection.token].username
											= message.data.connection.username;
		addConnectionToRoom(message.data.roomId, connectionBuff[message.data.connection.token]);
		delete connectionBuff[message.data.connection.token];
	} else if (message.cmd == 'del') {
		delConnectionFromRoom(message.data.roomId, message.data.connection);
	}
	printConnectionSnap();	
})

function addConnectionToRoom(roomId, connection){
	if (_.isEmpty(stConnections[roomId])) {
		stConnections[roomId] = [];
	}

	if (stConnections[roomId].indexOf(connection) < 0) {
		stConnections[roomId].push(connection);
	}
}

function delConnectionFromRoom(roomID, connection) {
	console.log('del connection.token = ' + connection.token + ' from roomID = ' + roomID );
}

function broadcast(roomId, message, omit){
	for (var key in stConnections[roomId]) {
		if (_.isEmpty(omit) || omit.indexOf(stConnections[roomId][key].token < 0)) {
			stConnections[roomId][key].write(JSON.stringify(message) + '\r\n');
		}
	}
}

function printConnectionSnap(){
	var snap = {};
	for (var roomID in stConnections) {
		snap[roomID] = [];
		for (var i = 0; i < stConnections[roomID].length; i++) {
			snap[roomID].push({
				username: stConnections[roomID][i].username,
				token: stConnections[roomID][i].token
			})
		}
	}
	console.log(snap);
}