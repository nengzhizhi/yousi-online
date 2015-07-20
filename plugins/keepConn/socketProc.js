var net = require('net');

var connections = {};
var connTemp = {};
var server = net.createServer();

server.on('connection', function (connection) {
	connection.on('end', function(){});
	connection.on('error', function(){});
	connection.on('close', function(){});
	connection.token = Date.now();
	connTemp[connection.token] = connection;

	connection.on('data', function (data) {
		data = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : JSON.parse(data);
		process.send({connection: connection.token, data: data});
	})
}).listen(10002);

process.on('message', function (m){
	if (m.cmd == 'broadcast') {
		broadcast(m.data.roomId, m.data.message, m.data.omit);
	} else if(m.cmd == 'add') {
		if (m.data.connection) {
			connTemp[m.data.connection].roomId = m.data.roomId;
			addConnection(m.data.roomId, connTemp[m.data.connection]);
			delete connTemp[m.data.roomId];
		}
	} else if(m.cmd == 'del') {
		delConnection();
	} else if(m.cmd == 'update') {
		updateConnections(m.data.roomId, m.data.answeringId);
	}
})

function broadcast(roomId, message, omit){
	for (var i in connections[roomId]) {
		if (!omit || omit.indexOf(connections[roomId][i].token) < 0) {
			connections[roomId][i].write(typeof(message) === 'string' ? message : JSON.stringify(message) + '\r\n');
		}
	}	
}

function addConnection(roomId, connection){
	if (roomId && !connections[roomId]) 
		connections[roomId] = [];

	if (connections[roomId].indexOf(connection) < 0)
		connections[roomId].push(connection);
}

function delConnection(roomId, connection, username){
	if (roomId && connections[roomId]) {

		var inx = connections[roomId].indexOf(connection);
		inx >= 0 && connections[roomId].splice(inx, 1);

		if (connections[roomId].length <= 0) {
			delete connection[roomId];
		}
	}
}

function updateConnection(roomId, answeringId){
	for (var i in connections[roomId]) {
		connections[roomId][i].answeringId = answeringId;
	}
}