var http = require('http');
var net = require('net');
var WebSocketServer = require('websocket').server;
var mongoose = require('mongoose');

module.exports = function(options) {
	var seneca = this;

	seneca.add({role:'keepConn', cmd:'initWsService'}, cmd_initWsService);
	seneca.add({role:'keepConn', cmd:'initStService'}, cmd_initStService);
	seneca.add({role:'keepConn', cmd:'addConnection'}, cmd_addConnection);
	seneca.add({role:'keepConn', cmd:'delConnection'}, cmd_delConnection);
	seneca.add({role:'keepConn', cmd:'broadcast'}, cmd_broadcast);
	seneca.add({role:'keepConn', cmd:'leaveRoom'}, cmd_leaveRoom);

	seneca.use('/plugins/answering/service');
	mongoose.connect('mongodb://yousi:password@112.124.117.146:27017/yousi');

	//初始化websocket连接服务器
	function cmd_initWsService(args, callback){
		seneca.httpServer = http.createServer(function (request, response){
			console.log((new Date()) + 'WebSocket http server received request for ' + request.url);
		    response.writeHead(404);
		    response.end();
		});

		seneca.httpServer.listen(options.wsServerPort, function(){
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
				try{
					//console.log((new Date()) + "Received message " + message.utf8Data);
					var req = JSON.parse(message.utf8Data);
					handleData('ws', connection, req);
				}
				catch(e){}
			});

			connection.on('close', function(reasonCode, description) {
				console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. roomId = ' + connection.roomId);
				seneca.act({
					role:'keepConn', cmd:'delConnection',
					data:{
						type : 'ws',
						roomId : connection.roomId,
						connection : connection
					}
				})
			});
		});
		callback(null, null);
	}

	//初始化socket连接服务器
	function cmd_initStService(args, callback) {
		seneca.stServer = net.createServer();

		seneca.stConnections = {};

		seneca.stServer.on('connection', function (connection) {
			connection.on('end', function(){
				seneca.act({
					role:'keepConn', cmd:'delConnection',
					data : {
						type : 'st',
						roomId : connection.roomId,
						connection : connection
					}
				})
			});

			connection.on('data', function (data) {
				//console.log((new Date()) + "Received message " + req);
				var req = JSON.parse(data);
				handleData('st', connection, req);
			});

			connection.on('error', function (err) {
				seneca.act({
					role:'keepConn', cmd:'delConnection',
					data : {
						type : 'st',
						roomId : connection.roomId,
						connection : connection
					}
				})				
			})
		});

		seneca.stServer.on('close', function (){
			console.log('close');
		})

		seneca.stServer.listen(options.stServerPort);
		callback(null, null);
	}

	function cmd_addConnection(args, callback){
		//TODO check roomId
		
		if (args.data.type == 'ws') {
			if (!seneca.wsConnections[args.data.roomId]) {
				seneca.wsConnections[args.data.roomId] = new Array();
			}

			if(seneca.wsConnections[args.data.roomId].indexOf(args.data.connection) < 0){
				seneca.wsConnections[args.data.roomId].push(args.data.connection);			
			}
			
			callback(null, {status:'success'});
		}
		else if(args.data.type == 'st'){
			if(!seneca.stConnections[args.data.roomId]) {
				seneca.stConnections[args.data.roomId] = new Array();
			}

			if(seneca.stConnections[args.data.roomId].indexOf(args.data.connection) < 0){
				seneca.stConnections[args.data.roomId].push(args.data.connection);
			}

			callback(null, {status:'success'});
		}
		else {
			callback(null, {status:'fail'});
		}
	}

	function cmd_delConnection(args, callback){
		//TODO check roomId

		if (args.data.type == 'ws') {
			if (seneca.wsConnections[args.data.roomId]) {
				var inx = seneca.wsConnections[args.data.roomId].indexOf(args.data.connection);
				if (inx >= 0 ) {
					seneca.wsConnections[args.data.roomId].splice(inx, 1);

					if (seneca.wsConnections[args.data.roomId].length <= 0) {
						delete seneca.wsConnections[args.data.roomId];
					}
				}
			}
			callback(null, {status:'success'});
		}
		else if(args.data.type == 'st') {
			if(seneca.stConnections[args.data.roomId]){
				var inx = seneca.stConnections[args.data.roomId].indexOf(args.data.connection);

				if (inx >= 0) {
					seneca.stConnections[args.data.roomId].splice(inx, 1);

					if (seneca.stConnections[args.data.roomId].length <= 0) {
						delete seneca.stConnections[args.data.roomId];
					}				
				}
			}
			callback(null, {status:'success'});
		}
		else {
			callback(null, {status:'fail'});
		}
	}

	function cmd_broadcast(args, callback){
		if (args.data.roomId) {
			var data = (typeof args.data.message === "string") ? 
						args.data.message : JSON.stringify(args.data.message);

			for (var i in seneca.stConnections[args.data.roomId]){
				seneca.stConnections[args.data.roomId][i].write(data + '\r\n');
			}

			for (var index in seneca.wsConnections[args.data.roomId]) {
				seneca.wsConnections[args.data.roomId][index].sendUTF(data);
			}
		}
		callback(null, null);
	}

	function cmd_leaveRoom(args, callback){
		console.log('length = ' + seneca.wtConnections[args.data.roomId].length);
		if (args.data.roomId && args.data.role) {
			for (var i in seneca.stConnections[args.data.roomId]) {
				if (seneca.stConnections[args.data.roomId][i].username == args.data.username) {
					seneca.stConnections[args.data.roomId].close();
					seneca.stConnections[args.data.roomId].remove(i);

					if (seneca.stConnections[args.data.roomId].length == 0) {
						delete seneca.stConnections[args.data.roomId];
					}
				}
			}

			for (var j in seneca.wsConnections[args.data.roomId]) {
				if (seneca.wtConnections[args.data.roomId][i].username == args.data.username) {
					seneca.wtConnections[args.data.roomId].close();
					seneca.wtConnections[args.data.roomId].remove(i);
				
					if (seneca.wsConnections[args.data.roomId].length == 0) {
						delete seneca.wsConnections[args.data.roomId];
					}
				}				
			}
		}
		console.log('length = ' + seneca.wtConnections[args.data.roomId].length);
	}

	function handleData(type, connection, req){
		if(req.c == 'join') {
			connection.roomId = req.data.roomId;
			connection.answeringId = req.data.answeringId;
			connection.username = req.data.username;
			seneca.act({
				role:'keepConn', cmd:'addConnection',
				data : {
					type : type,
					roomId : req.data.roomId,
					connection : connection
				}
			}, function (err, result) {
				if (req.data.answeringId) {
					seneca.act({role:'keepConn', cmd:'broadcast', data:{
						roomId : req.data.roomId,
						message : JSON.stringify({
							c : 'join_push',
							data : {
								roomId : req.data.roomId,
								answeringId : req.data.answeringId
							}
						})
					}});
				}
				// if (type == 'st'){
				// 	connection.write(JSON.stringify({c:'join',data:{status:'success'}}));
				// } else if(type == 'ws'){
				// 	connection.sendUTF(JSON.stringify({c:'join',data:{status:'success'}}));
				// }
			})
		}
		else if(req.c == 'draw') {
			seneca.act({
				role:'keepConn', cmd:'broadcast',
				data : {
					message : req,
					roomId : connection.roomId								
				}
			})

			if (connection.answeringId) {
				seneca.act({
					role:'answering', cmd:'saveOperations',
					data : {
						answeringId : connection.answeringId,
						op : req.data.op,
						t : req.data.t
					}
				})
			}
		}
		else if(req.c == 'leave') {}
		else if(req.c == 'upload') {
			seneca.act({
				role : 'keepConn', cmd : 'broadcast',
				data : {
					roomId : connection.roomId,
					message : {
						c : 'upload_push',
						data : { url:req.data.url, meta:req.data.meta }
					}
				}
			});
			// if (req.data.roomId && req.data.answeringId) {
			// 	seneca.act({
			// 		role:'answering', cmd:'addQuestion',
			// 		data : req.data;
			// 	})

			// 	seneca.act({
			// 		role:'keepConn', cmd:'broadcast',
			// 		data:{
			// 			roomId : req.data.roomId,
			// 			message : {
			// 				c : 'upload_push',
			// 				data : {key:req.data.key,meta:req.data.meta}
			// 			}
			// 		}
			// 	})
			// }
		}
		else if(req.c == 'update_connection') {
			connection.answeringId = req.data.answeringId;
		}
	}
}