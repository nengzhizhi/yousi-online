var assert = require('assert');
var _ = require('lodash');
var net = require('net');
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

describe("Socket", function(){
	// describe("#connect", function(){
	// 	it("ok", function (done) {
	// 		var client = net.connect({port: 10002}, function(){
	// 			done();
	// 		});
	// 	})
	// })

	describe("#enter", function(){
		it("ok", function (done) {
			var client = net.connect({port: 10002}, function(){
				client.write(JSON.stringify({
					c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
				}));
			});

			client.on('data', function (data) {
				console.log(data.toString());
				done();
			})
		})
	})
})


describe("WebSocekt", function(){
	// describe("#connect", function () {
	// 	it("ok", function (done) {
	// 		client.on('connect', function (connection) {
	// 			assert.ifError(_.isEmpty(connection));
	// 			done();
	// 		})
	// 		client.connect('ws://127.0.0.1:10001', 'echo-protocol');
	// 	})
	// })

	// describe("#enter", function(){
	// 	it("输出正确的连接数量", function (done) {
	// 		var client_001 = new WebSocketClient();
	// 		client_001.on('connect', function (connection) {
	// 			connection.sendUTF(JSON.stringify({
	// 				c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 			}))
	// 		})			
	// 		client_001.connect('ws://127.0.0.1:10001', 'echo-protocol');

	// 		client.on('connect', function (connection) {
	// 			connection.sendUTF(JSON.stringify({
	// 				c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 			}))

	// 			connection.on('message', function(message){
	// 				var req = JSON.parse(message.utf8Data);
	// 				if (req.c == 'debug') {
	// 					console.log(req.data);
	// 					done();
	// 				}
	// 			})
	// 		})
	// 		client.connect('ws://127.0.0.1:10001', 'echo-protocol');
	// 	})
	// })
})