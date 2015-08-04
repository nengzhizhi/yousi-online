var cp = require('child_process');
var _ = require('lodash');

module.exports = function(options) {
	var seneca = this;
	seneca.rooms = {};

	seneca.use('/plugins/answering/service');
	seneca.add({ role: 'keepConn', cmd: 'start'}, cmd_start);

	function cmd_start (args, callback) {
		startWsServer(10001);
		startStServer(10002);
		callback(null, {status: 'success'});
	}

	function startWsServer (wsPort) {
		seneca.webSocketProc = cp.fork(__dirname + '/webSocketProc.js');
		seneca.webSocketProc.on('message', function (message) {
			handleNetWorkData('ws', message.act, message.token, message.data);
		})
	}

	function startStServer (stPort) {
		seneca.socketProc = cp.fork(__dirname + '/socketProc.js');
		seneca.socketProc.on('message', function (message) {
			handleNetWorkData('st', message.act, message.token, message.data);
		})
	}


	function addToRoom (roomId, token, user) {
		if (_.isEmpty(seneca.rooms[roomId])) {
			seneca.rooms[roomId] = {};
		}
		seneca.rooms[roomId][token] = { user: user };
	}

	function removeFromRoom(roomId, token) {
		if (seneca.rooms[roomId] && seneca.rooms[roomId][token]) {
			delete seneca.rooms[roomId][token];
		}
	}

	function broadcast(roomId, msg, omit){
		seneca.socketProc.send({ cmd: 'broadcast', msg: msg, room: seneca.rooms[roomId], omit: omit });
		seneca.webSocketProc.send({ cmd: 'broadcast', msg: msg, room: seneca.rooms[roomId], omit: omit });
	}

	function handleNetWorkData(type, act, token, raw){
		var message = raw;
		if (act == 'message') {
			handleBusinessData(token, message.c, message.data);
		} else if (act == 'close') {
			var data = {};
			for (var key in seneca.rooms) {
				if (seneca.rooms[key][token] != undefined) {
					console.log(seneca.rooms[key][token]);
					data.roomId = key;
					data.username = seneca.rooms[key][token].username;
				}
			}			
			handleBusinessData(token, 'interrupt', data);
		}
		//console.log(seneca.rooms);
	}

	function handleBusinessData (token, c, data) {
		//console.log(c);
		if (c == 'enter') {
			var roomId = data.roomId;
			var username = data.username;
			var role = data.role;

			addToRoom(roomId, token, { username: username, role: role });
			broadcast(roomId, { c: 'enter_push', data: { username: username }}, [token]);
		
		} else if (c == 'interrupt') {
			var roomId = data.roomId;
			var username = data.roomId;

			removeFromRoom(roomId, token);
			broadcast(roomId, { c: 'interrupt_push', data: { username: username }})
		} else if (c == 'answer') {
			var roomId = data.roomId;
			var username = data.username;
			var role = data.role;

			seneca.act({
				role: 'answering',
				cmd: 'startAnswering',
				data: { roomId: roomId, username: username, role: role }
			}, function (err, result) {
				if (_.isEmpty(err)) {
					var message = {
						c: 'answer_push',
						data: {
							roomId: roomId,
							answeringId: result._id
						}
					}
					broadcast(roomId, message);
				}
			})

		} else if (c == 'leave') {
			var roomId = data.roomId;
			var username = data.username;
			var role = data.role;
			var answeringId = data.answeringId;

			removeFromRoom(roomId, token);
			broadcast(roomId, { c: 'leave_push', data: { username: username }})

			//更新数据库中房间对应的状态
			seneca.act({role: 'answering', cmd: 'changeRoomState',
				data: {
					action: 'leave',
					roomId: roomId,
					role: role,
					username: username,
					answeringId: answeringId
				}
			})
		} else if (c == 'draw') {
			var roomId = data.roomId;
			broadcast(roomId, { c: 'draw', data: data }, [token]);
		} else if (c == 'upload') {
			var roomId = data.roomId;
			
			var message = {
				c: 'upload_push',
				data: { url: 'http://7xkjiu.media1.z0.glb.clouddn.com/' + req.data.key, meta: req.data.meta }				
			}
			broadcast(roomId, message);
		}
	}
}