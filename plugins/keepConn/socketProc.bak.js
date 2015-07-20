var net = require('net');

var stConnections = [];
var stServer = net.createServer();
stServer.on('connection', function (connection){
	connection.on('end', function(){})

	connection.on('error', function (err){});

	connection.on('data', function (data){
		console.log("data");
		handleBusiness(connection, JSON.parse(data));
	})
});

stServer.on('close', function(){})
stServer.listen(10002);


function handleBusiness(connection, req){
	if (req.c == 'join') {
		connection.roomId = req.data.roomId, 
		connection.answeringId = req.data.answeringId,
		connection.username = req.data.username;
		connection.token = Date.now();

		addStConnection(req.data.roomId, connection);

		broadcast(
			req.data.roomId, 
			{
				c: 'join_push', data: {
					roomId: req.data.roomId, 
					answeringId: req.data.answeringId,
					username: req.data.username
				}				
			},
			[connection.token]
		)		
	}
}

process.on('message', function (m){
	if (m.cmd == 'broadcast') {
		for (var i in stConnections[m.data.roomId]) {
			stConnections[m.data.roomId][i].write(JSON.stringify(m.data.message) + '\r\n');
		}
	}
})

function broadcast(roomId, message, omit){
	process.send({cmd: 'broadcast', data: {
			roomId: roomId,
			message: message
		}
	})

	for (var i in stConnections[roomId]) {
		if (omit && omit.indexOf(stConnections[roomId][i].token) < 0) {
			stConnections[roomId][i].write(JSON.stringify(message) + '\r\n');
		}
	}
}

function addStConnection(roomId, connection){
	if (roomId && !stConnections[roomId]) {
		stConnections[roomId] = [];
	}

	if (stConnections[roomId].indexOf(connection) < 0) {
		stConnections[roomId].push(connection);
	}
}

function delStConnection(roomId, connection){}