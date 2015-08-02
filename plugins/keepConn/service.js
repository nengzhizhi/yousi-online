var http = require('http');
var WebSocketServer = require('websocket').server;
var cp = require('child_process');
var _ = require('lodash');

module.exports = function(options) {
	var seneca = this;

	seneca.use('/plugins/answering/service');

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
			
			//断开webSocket连接，退出房间
			connection.on('close', function (reasonCode, description) {
				// delWsConnection(connection.roomId, connection);
				handleBusinessData('ws', connection, {
					c: 'interrupt',
					data: { 
						roomId: connection.roomId, 
						username: connection.username, 
						role: connection.role, 
						answeringId: connection.answeringId 
					}
				});
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
		
		//TODO 检查输入格式

		console.log(req.c);
		if (req.c == 'enter') {
			if (type == 'ws') {
				connection.roomId = req.data.roomId,
				connection.username = req.data.username,
				connection.role = req.data.role;

				addWsConnection(req.data.roomId, connection);
			} else if (type == 'st') {
				seneca.socketProc.send({cmd: 'add', data: {
					roomId: req.data.roomId,
					username: req.data.username,
					role: req.data.role,
					connection: connection
				}});
			}

			broadcast(
				req.data.roomId, {
					c: 'enter_push', 
					data: { username: req.data.username, roomId: req.data.roomId }
				},
				type === 'ws' ? [connection.token] : [connection]
			);
		} else if(req.c == 'answer') {
			seneca.act({
				role: 'answering', cmd: 'startAnswering',
				data: {
					roomId: req.data.roomId,
					username: req.data.username,
					role: req.data.role
				}
			}, function (err, result) {
				if (!_.isEmpty(err) || _.isEmpty(result)) {
					//创建答疑失败
				} else {
					//更新答疑Id
					updateConnections(req.data.roomId, result._id);

					var message = {
						c: 'answer_push',
						data: {
							roomId: req.data.roomId,
							answeringId: result._id
						}
					}

					broadcast(req.data.roomId, message);
				}
			})
		}
		//处理所有离开房间的事务
		else if( req.c == 'leave') {
			//删除房间里用户名对应的websocket连接
			delWsConnections(req.data.roomId, req.data.username);
			updateConnections(req.data.roomId);
			//删除房间中用户名对应的socket连接
			seneca.socketProc.send({cmd: 'multiDel', data: {
				roomId: req.data.roomId,
				username: req.data.username
			}});

			var message = {c: 'leave_push', data: {username: req.data.username}};
			broadcast(req.data.roomId, message);

			//更新数据库中房间对应的状态
			seneca.act({role: 'answering', cmd: 'changeRoomState',
				data: {
					action: 'leave',
					roomId: req.data.roomId,
					role: req.data.role,
					username: req.data.username,
					answeringId: req.data.answeringId
				}
			})
		}
		//异常中断
		else if (req.c == 'interrupt') {
			//删除房间里用户名对应的websocket连接
			delWsConnections(req.data.roomId, req.data.username);
			updateConnections(req.data.roomId);
			//删除房间中用户名对应的socket连接
			seneca.socketProc.send({cmd: 'multiDel', data: {
				roomId: req.data.roomId,
				username: req.data.username
			}});

			var message = {c: 'interrupt_push', data: {username: req.data.username}};
			broadcast(req.data.roomId, message);

			//更新数据库中房间对应的状态
			seneca.act({role: 'answering', cmd: 'changeRoomState',
				data: {
					action: 'interrupt',
					roomId: req.data.roomId,
					role: req.data.role,
					username: req.data.username,
					answeringId: req.data.answeringId
				}
			})
		} 
		else if (req.c == 'draw') {
			broadcast(connection.roomId, req, type === 'ws' ? [connection.token] : [connection]);

			//FIXME reduce save times
			if (connection.answeringId) {
				seneca.act({role: 'answering', cmd: 'saveOperations', data: {
					answeringId: connection.answeringId,
					op: req.data.op,
					t: req.data.t
				}})
			}
		}
		else if (req.c == 'upload') {
			var roomId = connection.roomId ? connection.roomId : req.data.roomId;
			var message = {
				c: 'upload_push',
				//FIXME dynamic get img bucket url
				data: { url: 'http://7xkjiu.media1.z0.glb.clouddn.com/' + req.data.key, meta: req.data.meta }
			}
			broadcast(roomId, message);
		}
		
		//----------------------------------------------------------------------------------------------------
		//FIXME
		else if (req.c == 'unitTest.broadcast') {
			broadcast(connection.roomId, { c: 'unitTest.broadcast' });
		}
		else if (req.c == 'unitTest.viewWsConnections') {
			var connections = {};
			for (var roomId in seneca.wsConnections) {
				connections[roomId] = [];
				for (var i = 0 ; i < seneca.wsConnections[roomId].length; i++) {
					connections[roomId].push({
						username: seneca.wsConnections[roomId][i].username
					});
				}
			}

			broadcast(connection.roomId, { 
				c: 'unitTest.viewWsConnections', 
				data: { 
					wsConnections: connections		
				}
			})
		}
	}

	function broadcast(roomId, message, omit){
		//broadcast in websocket connections
		for (var i in seneca.wsConnections[roomId]) {
			if (_.isEmpty(omit) || omit.indexOf(seneca.wsConnections[roomId][i].token) < 0) {
				seneca.wsConnections[roomId][i].sendUTF(JSON.stringify(message));
			}
		}		

		//broadcast in socket connections
		seneca.socketProc && seneca.socketProc.send({cmd: 'broadcast', data: {
			roomId: roomId,
			message: message,
			omit: omit
		}})
	}

	function addWsConnection(roomId, connection){
		if (!seneca.wsConnections[roomId])
			seneca.wsConnections[roomId] = [];

		if (seneca.wsConnections[roomId].indexOf(connection) < 0)
			seneca.wsConnections[roomId].push(connection);
	}

	//delete specified connection in room
	function delWsConnection(roomId, connection){
		if (roomId && seneca.wsConnections[roomId]) {
			var inx = seneca.wsConnections[roomId].indexOf(connection); 
			inx >= 0 && seneca.wsConnections[roomId].splice(inx, 1);

			seneca.wsConnections[roomId].length <= 0 
				&& delete seneca.wsConnections[roomId];
		}
	}

	//delete connections of username in room
	function delWsConnections(roomId, username) {
		for (var i in seneca.wsConnections[roomId]) {
			if (username && seneca.wsConnections[roomId][i].username == username) {
				seneca.wsConnections[roomId][i].close();
				seneca.wsConnections[roomId].splice(i, 1);

				if (seneca.wsConnections[roomId].length == 0) {
					//TODO 
					//房间所有老师的连接都断开，答疑结束

					delete seneca.wsConnections[roomId];
				}
			}
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
