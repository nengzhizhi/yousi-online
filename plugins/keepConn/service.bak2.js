var http = require('http');
var WebSocketServer = require('websocket').server;
var cp = require('child_process');

module.exports = function(options) {
	var seneca = this;

	seneca.add({role: 'keepConn', cmd: 'init'}, cmd_init);

	function cmd_init(args, callback){
		seneca.httpServer = http.createServer(function (request, response){
			console.log((new Date()) + 'WebSocket http server received request for ' + request.url);
		    response.writeHead(404);
		    response.end();
		});

		seneca.httpServer.listen(10001, function(){
			console.log((new Date()) + 'WebSocket http server is listening on port ' + options.wsServerPort);
		});

		seneca.wsServer = new WebSocketServer({
			httpServer : seneca.httpServer,
			autoAcceptConnections : false
		});

		//websocket连接
		seneca.wsConnections = {};

		seneca.wsServer.on('request', function (request) {
			//检查origin
			var connection = request.accept('echo-protocol', request.origin);
			console.log((new Date()) + ' Connection accepted.');

			connection.on('message', function (message) {
				var req = JSON.parse(message.utf8Data);
				handleBusiness(connection, req);
			});

			connection.on('close', function(reasonCode, description) {
				console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. roomId = ' + connection.roomId);
				delWsConnection(connection.roomId, connection);
			});
		});

		seneca.socketProc = cp.fork(__dirname + '/socketProc.js');
		seneca.socketProc.on('message', function (m) {
			handleProcMsg();
		})
		callback(null, null);
	}

//-----------------------------------------------------------------------------------
	function handleBusiness(connection, req){
		if (req.c == 'join') {
			connection.roomId = req.data.roomId, 
			connection.answeringId = req.data.answeringId,
			connection.username = req.data.username;
			connection.token = Date.now();

			//TODO check roomId
			addWsConnection(req.data.roomId, connection);

			broadcast(
				req.data.roomId, {
					c: 'join_push',
					data: {
						roomId: req.data.roomId, 
						answeringId: req.data.answeringId,
						username: req.data.username
					}				
				},
				[connection.token]
			)
		} else if (req.c == 'draw') {
			broadcast(connection.roomId, req)

		} else if (req.c == 'upload') {

		} else if (req.c == 'update') {

		}
	}

	function broadcast(roomId, message, omit){
		seneca.socketProc && seneca.socketProc.send({cmd: 'broadcast', data: {
			roomId: roomId,
			message: message
		}})

		for (var i in seneca.wsConnections[roomId]) {
			if (omit && omit.indexOf(seneca.wsConnections[roomId][i].token) < 0) {
				seneca.wsConnections[roomId][i].sendUTF(JSON.stringify(message));
			}
		}
	}

	function addWsConnection(roomId, connection){
		if (roomId && !seneca.wsConnections[roomId]) {
			seneca.wsConnections[roomId] = [];
		}

		if (seneca.wsConnections[roomId].indexOf(connection) < 0) {
			seneca.wsConnections[roomId].push(connection);
		}
	}

	function delWsConnection(roomId, connection){
		if (roomId && seneca.wsConnections[roomId]) {
			var inx = seneca.wsConnections[roomId].indexOf(connection); 
			inx >= 0 && seneca.wsConnections[roomId].splice(inx, 1);

			seneca.wsConnections[roomId].length <= 0 
				&& delete seneca.wsConnections[roomId];
		}
	}
//-----------------------------------------------------------------------------------	
}