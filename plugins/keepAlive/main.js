var seneca = require('seneca')();
var http = require('http');
var WebSocketServer = require('websocket').server;
var net = require('net');
var _ = require('lodash');

module.exports = function(options){
	var seneca = this;

	//for test
	seneca.use('../../unitTest/keepAlive/test');

	seneca.wsConnections = {};
	seneca.stConnections = {};
	seneca.messageObservers = {};
	seneca.closeObservers = {};
	seneca.connectObservers = {};

	seneca.add({role: 'keepAlive', cmd: 'start'}, cmd_start);
	seneca.add({role: 'keepAlive', cmd: 'register'}, cmd_register);
	seneca.add({role: 'keepAlive', cmd: 'broadcast'}, cmd_broadcast);
	seneca.add({role: 'keepAlive', cmd: 'reply'}, cmd_reply);

	function cmd_start (args, callback) {
		//初始化webSocket连接
		seneca.httpServer = http.createServer(function (request, response){
			response.writeHead(404).end();
		})

		seneca.httpServer.listen(10001);
		seneca.wsServer = new WebSocketServer({
			httpServer: seneca.httpServer,
			autoAcceptConnections: false
		})

		seneca.wsServer.on('request', function (request) {
			var connection = request.accept('echo-protocol', request.origin);
			connection.token = Date.now().toString();
			seneca.wsConnections[connection.token] = connection;

			connection.on('close', function (reasonCode, description) {
				for (var key in seneca.closeObservers) {
					seneca.closeObservers[key](connection.token);
				}
			})

			connection.on('message', function (message) {
				var message = JSON.parse(message.utf8Data);
				for (var key in seneca.messageObservers[message.c]) {
					seneca.messageObservers[message.c][key](message.data, connection.token);
				}
			})
		})

		//初始化socket链接
		seneca.stServer = net.createServer();
		seneca.stServer.on('connection', function (connection) {
			connection.token = Date.now().toString();
			seneca.stConnections[connection.token] = connection;

			connection.on('data', function (data) {
				var data = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : JSON.parse(data);

				for (var key in seneca.messageObservers[message.c]) {
					seneca.messageObservers[message.c][key](message.data, connection.token);
				}
			})

			connection.on('close', function(){
				for (var key in seneca.closeObservers) {
					seneca.closeObservers[key](connection.token);
				}
			})

			connection.on('error', function (err) {
				console.log("socket error" + err);
			})
		}).listen(100002);

		callback(null, null);
	}

	function cmd_register (args, callback) {
		var role = args.data.role;
		var cmd = args.data.cmd;
		var type = args.data.type;
		var c = args.data.c;

		if (type == 'message') {
			var func = function (data, token) {
				if (_.isEmpty(data)) {
					data = { token: token }
				} else {
					data.token = token;
				}
				seneca.act({role: role, cmd: cmd, data: data});
			}

			if (_.isEmpty(seneca.messageObservers[c])) {
				seneca.messageObservers[c] = [];
			}

			seneca.messageObservers[c].push(func);

		} else if (type == 'close') {
			var func = function (token) {
				seneca.act({role: role, cmd: cmd, data: {token: token}})
			}
			seneca.closeObservers.push(func); 
		} else if (type == 'connect') {}

		callback(null, null);
	}

	function cmd_broadcast (args, callback) {
		var tokens = args.data.tokens;
		var msg = args.data.msg;

		for (var key in tokens) {
			var token = tokens[key];
			if (!_.isEmpty(seneca.wsConnections[token])){
				seneca.wsConnections[token].sendUTF(JSON.stringify(msg));
			} else if(!_.isEmpty(seneca.stConnections[token])) {
				seneca.stConnections[token].send(JSON.stringify(msg));
			}
		}

		callback(null, null);
	}

	function cmd_reply (args, callback) {
		var token = args.data.token;
		var msg = args.data.msg;

		if (!_.isEmpty(seneca.wsConnections[token])) {
			seneca.wsConnections[token].sendUTF(JSON.stringify(msg));
		} else if(!_.isEmpty(seneca.stConnections[token])) {
			seneca.stConnections[token].send(JSON.stringify(msg));
		}
	}
}