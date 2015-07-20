var http = require('http');
var WebSocketServer = require('websocket').server;
var cp = require('child_process');

module.exports = function(options) {
	var seneca = this;

	seneca.add({role: 'keepConn', cmd: 'init'}, cmd_init);

	function cmd_init(args, callback){
		//init websocket server
		seneca.httpServer = http.createServer(function (request, response){
			console.log((new Date()) + 'WebSocket http server received request for ' + request.url);
			response.writeHead(404);
			response.end();
		});

		//FIXME dynamic get port
		seneca.httpServer.listen(10001, function(){
			console.log((new Date()) + 'WebSocket http server is listening on port ' + options.wsServerPort);
		});

		seneca.wsServer = new WebSocketServer({
			httpServer: seneca.httpServer,
			autoAcceptConnections: false			
		})
		seneca.wsConnections = {};

		seneca.wsServer.on('request', function (request) {
			var connection = request.accept('echo-protocol', request.origin);
			connection.token = Date.now();
			console.log((new Date()) + ' Connection accepted.');

			connection.on('close', function (reasonCode, description) {
				delWsConnection(connection.roomId, connection);
			})

			connection.on('message', function (message) {
				handleBusinessData('ws', connection, message.utf8Data);
			})
		})


		seneca.socketProc = cp.fork(__dirname + '/socketProc.js');
		seneca.socketProc.on('message', function (m) {
			handleBusinessData('st', m.connection, m.data);
		})
		callback(null, {status: 'success'});
	}

	function handleBusinessData(type, connection, rawData){
		var req = (typeof(rawData)==="string" ? JSON.parse(rawData) : rawData);

		if(req.c == 'join') {
			//TODO 
			//determine whether can join room！(use signed username)

			if (type == 'ws') {
				connection.roomId = req.data.roomId, 
				connection.answeringId = req.data.answeringId,
				connection.username = req.data.username;

				addWsConnection(req.data.roomId, connection);			
			} else if (type == 'st'){
				seneca.socketProc.send({cmd: 'add', data: {
					roomId: req.data.roomId, 
					answeringId: req.data.answeringId,
					username: req.data.username,
					connection: connection
				}});
			}

			//更新房间的答疑ID
			req.data.answeringId && updateConnections(req.data.roomId, req.data.answeringId);

			var message = {c: 'join_push', data: {
					roomId: req.data.roomId, 
					answeringId: req.data.answeringId,
					username: req.data.username				
				}
			}
			broadcast(connection.roomId, message, type === 'ws' ? [connection.token] : [connection]);			
		}
		else if (req.c == 'draw') {
			broadcast(connection.roomId, req, type === 'ws' ? [connection.token] : [connection]);

			if (connection.answeringId) {
				seneca.act({role: 'answering', cmd: 'saveOperations', data: {
					answeringId: connection.answeringId,
					op: req.data.op,
					t: req.data.t
				})
			}
		}
		else if (req.c == 'upload') {
			var roomId = connection.roomId ? connection.roomId : req.data.roomId;
			var message = {
				c: 'upload_push',
				//FIXME dynamic get img bucket url
				data: { url: 'http://7xk9po.com1.z0.glb.clouddn.com/' + req.data.key, meta: req.data.meta }
			}
			broadcast(roomId, message);
		}
	}

	function broadcast(roomId, message, omit){
		//broadcast in socket connections
		seneca.socketProc && seneca.socketProc.send({cmd: 'broadcast', data: {
			roomId: roomId,
			message: message,
			omit: omit
		}})

		//broadcast in websocket connections
		for (var i in seneca.wsConnections[roomId]) {
			if (!omit || omit.indexOf(seneca.wsConnections[roomId][i].token) < 0 ) {
				seneca.wsConnections[roomId][i].sendUTF(JSON.stringify(message));
			}
		}
	}

	function addWsConnection(roomId, connection){
		if (!seneca.wsConnections[roomId])
			seneca.wsConnections[roomId] = [];

		if (seneca.wsConnections[roomId].indexOf(connection) < 0)
			seneca.wsConnections[roomId].push(connection);
	}

	function delWsConnection(roomId, connection){
		if (roomId && seneca.wsConnections[roomId]) {
			var inx = seneca.wsConnections[roomId].indexOf(connection); 
			inx >= 0 && seneca.wsConnections[roomId].splice(inx, 1);

			seneca.wsConnections[roomId].length <= 0 
				&& delete seneca.wsConnections[roomId];
		}
	}

	function updateConnections(roomId, answeringId) {
		//update room's websocket connection 
		for (var i in seneca.wsConnections[roomId]) {
			seneca.wsConnections[roomId][i].answeringId = answeringId;
		}

		//update room's socket connection
		seneca.socketProc.send({cmd: 'update', data: {
			roomId: roomId,
			answeringId: answeringId
		}});
	}
}
