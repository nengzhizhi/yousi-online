var http = require('http');
var net = require('net');
var WebSocketServer = require('websocket').server;
var memwatch = require('memwatch');

module.exports = function(options) {
	var seneca = this;

	seneca.use('/plugins/answering/service');

	seneca.add({role:'keepConn', cmd:'initWsService'}, cmd_initWsService);
	seneca.add({role:'keepConn', cmd:'initStService'}, cmd_initStService);
	seneca.add({role:'keepConn', cmd:'addConnection'}, cmd_addConnection);
	seneca.add({role:'keepConn', cmd:'delConnection'}, cmd_delConnection);
	seneca.add({role:'keepConn', cmd:'broadcast'}, cmd_broadcast);
	seneca.add({role:'keepConn', cmd:'leaveRoom'}, cmd_leaveRoom);

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
				seneca.wsConnections[args.data.roomId] = [];
			}

			if(seneca.wsConnections[args.data.roomId].indexOf(args.data.connection) < 0){
				seneca.wsConnections[args.data.roomId].push(args.data.connection);			
			}
			
			callback(null, {status:'success'});
		}
		else if(args.data.type == 'st'){
			if(!seneca.stConnections[args.data.roomId]) {
				seneca.stConnections[args.data.roomId] = [];
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
		console.log(args.data.roomId);
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

		if (args.data.roomId) {
			seneca.act({
				role: 'keepConn', cmd: 'broadcast',
				data : {
						roomId : args.data.roomId,
						message : {
							c : 'leave_push',
							data : { username: args.data.username }
						}
				}
			})

			if (seneca.stConnections) {
				for (var i in seneca.stConnections[args.data.roomId]) {
					if (seneca.stConnections[args.data.roomId][i].username == args.data.username) {
						seneca.stConnections[args.data.roomId].close();
						//fixme
						delete stConnections[args.data.roomId][i];

						if (seneca.stConnections[args.data.roomId].length == 0) {
							delete seneca.stConnections[args.data.roomId];
						}
					}
				}
			}
			if (seneca.wsConnections) {
				for (var j in seneca.wsConnections[args.data.roomId]) {
					console.log("j = " + j);
					if (seneca.wsConnections[args.data.roomId][j].username == args.data.username) {
						seneca.wsConnections[args.data.roomId][j].close();
						//console.log(seneca.wsConnections[args.data.roomId].length);
						//seneca.wsConnections[args.data.roomId].splice(j, 1);
						//fixme
						delete seneca.wsConnections[args.data.roomId][j]
						//console.log(seneca.wsConnections[args.data.roomId].length);
						
						if (seneca.wsConnections[args.data.roomId].length == 0) {
							delete seneca.wsConnections[args.data.roomId];
						}
						
					}				
				}
			}
		}
		callback(null, null);
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
								answeringId : req.data.answeringId,
								username : req.data.username
							}
						})
					}});
				}
			})
		}
		else if(req.c == 'draw') {
			//insepect mem leak
			//var hd = new memwatch.HeapDiff();
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
			//inspect mem leak
			//var diff = hd.end();
			//console.log('diff = ' + JSON.stringify(diff));
		}
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
		}
		else if(req.c == 'update_connection') {
			connection.answeringId = req.data.answeringId;
		}
	}
}