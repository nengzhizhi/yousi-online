var http = require('http');
var WebSocketServer = require('websocket').server;
var cp = require('child_process');
var _ = require('lodash');

/*

	connections = { token: connection }
	user: {
		username: 'nengzhizhi',
		token: 'xxxx-xxxx-xxxx',
		role: 'teacher'/'student'/'visitor'/'supervisor',
		connection: connection
	}

	connections = {
		roomID: {
			token: connection,
			token: connection
		}
	}

*/

module.exports = function(options) {
	var seneca = this;
	seneca.wsConnections = {};

	seneca.add({ role: 'keepConn', cmd: 'start' }, cmd_start);

	function cmd_init (args, callback) {
		startWsServer(args.wsServerPort || 10001);
		startStServer(args.stServerPort || 10002);
		callback(null, { status: 'success' });
	}

	function startWsServer(wsPort){
		seneca.httpServer = http.createServer(function (request) {
			response.end();
		}).listen(wsPort);

		seneca.wsServer = new WebSocketServer({
			httpServer: seneca.httpServer,
			autoAcceptConnections: false
		})

		seneca.wsServer.on('request', function (request) {
			var connection = request.accept('echo-protocol', request.origin);
			connection.token = Date.now();
			handleNetworkData('ws', 'request', connection, request);

			connection.on('close', function (reasonCode, description) {
				handleNetworkData('ws', 'close', connection, reasonCode);
			})

			connection.on('message', function (message) {
				handleNetworkData('ws', 'message', connection, message);
			})
		})
	}

	function startStServer(stPort){
		seneca.socketProc = cp.fork(__dirname + '/socketProc.js');
		seneca.socketProc.on('message', function (m) {
			handleNetworkData('st', m.act, m.connection, m.data);
		})
	}


	function handleNetworkData(type, act, connection, raw){
		if (type == 'ws') {
			if (act == 'request') {
				//TODO 长时间没有'enter'断开连接
				connection.type = 'ws';
			} else if (act == 'message') {
				var message = JSON.parse(raw.utf8Data);
				handleBussinessData(message.c, message.data, connection);
			} else if (act == 'close') {
				handleBussinessData('interrupt', 
									{ roomId: connection.roomId, username: connection.username },
									connection);
			} else {
				//未知请求
			}

			connection.sendUTF(JSON.stringify({ 
				c: 'debug', data: { snap: getConnectionsSnap() }}));			
		} else if (type == 'st') {
			if (act == 'connection') {

			} else if (act == 'data') {
				handleBussinessData(raw.c, raw.data, connection);
			} else if (act == 'close') {
				handleBussinessData('interrupt', 
									{ roomId: raw.roomId, username: raw.username }, 
									connection);
			}
		}
	}

	function addConnectionToRoom (roomId, connection) {
		if (connection.type == 'ws') {
			if (_.isEmpty(seneca.wsConnections[roomId])) {
				seneca.wsConnections[roomId] = [];
			}

			if (seneca.wsConnections[roomId].indexOf(connection) < 0) {
				seneca.wsConnections[roomId].push(connection);
			}
		} else if (connection.type == 'st') {
			seneca.socketProc.send({cmd: 'add', 
									data: {
										roomId: roomId,
										connection: connection
									}});
		}
	}

	function delConnectionFromRoom (roomId, connection) {
		if (connection.type == 'ws') {
			if (seneca.wsConnections[roomId]) {
				var inx = seneca.wsConnections[roomId].indexOf(connection);
				inx >= 0 && seneca.wsConnections[roomId].splice(inx, 1);

				if (seneca.wsConnections[roomId].length <= 0) {
					delete seneca.wsConnections[roomId];
				}
			}
		} else if (connection.type == 'st') {
			seneca.socketProc.send({
				cmd: 'del',
				data: {
					roomId: roomId,
					connection: connection
				}
			})
		}
	}

	function broadcast(roomId, message, omit){
		//socket中广播
		seneca.socketProc.send({cmd: 'broadcast', 
								data: { roomId: roomId, message: message, omit: omit }});		
		//websocket中广播
		for (var key in seneca.wsConnections[roomId]) {
			if (_.isEmpty(omit) || omit.indexOf(seneca.wsConnections[roomId][key].token < 0)) {
				seneca.wsConnections[roomId][key].sendUTF(JSON.stringify(message));
			}
		}
	}
//-----------------------------------------------------------------------
	function handleBussinessData(c, data, connection){
		if (c == 'enter') {	
			//检查输入
			connection.roomId = data.roomId;
			connection.username = data.username;
			connection.role = data.role;
			//检查权限

			seneca.act({ role: 'answering', cmd: 'nextState', data: {xxx} }, function (err, result){
				if (result.status == 'success') {

				} else if (result.status == 'fail') {

				}
			})

			//处理结果
			addConnectionToRoom(data.roomId, connection);
			broadcast(data.roomId, { c: 'enter_push', 
									 data: { username: data.username, role: 'xxx' }});

		} else if (c == 'interrupt') {
			delConnectionFromRoom(data.roomId, connection);
			broadcast(data.roomId, { c: 'interrupt_push',
									 data: { username: data.username}})
		} else if (c == 'answer') {

		} else if (c == 'leave') {

		} else if (c == 'draw') {
			broadcast(data.roomId, {c: c, data: data}, connection.token)
		} else if (c == 'upload') {

		}
	}
//------------------------------------------------------------------------

	function getConnectionsSnap(){
		var snap = {};
		for(var roomId in seneca.wsConnections) {
			snap[roomId] = [];
			for(var key in seneca.wsConnections[roomId]) {
				snap[roomId].push(seneca.wsConnections[roomId][key].username);
			}
		}
		return snap;
	}
}

