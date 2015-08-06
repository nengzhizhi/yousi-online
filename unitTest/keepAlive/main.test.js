var WebSocketClient = require('websocket').client;
var seneca = require('seneca')();

seneca.client({host: 'localhost', port: 7001, pin: {role:'keepAlive',cmd:'*'}});

describe("KeepAlive", function(){
	// describe("#cmd_start", function(){
	// 	it("ok", function (done) {
	// 		seneca.act({
	// 			role: 'keepAlive', 
	// 			cmd: 'start', 
	// 			data: {	}
	// 		}, function (err, result) {
	// 			//console.log(result);
	// 			//done();
	// 		})
	// 	})
	// })


	describe("#register", function(){
		it("ok", function (done){
			seneca.act({
				role: 'keepAlive',
				cmd: 'register',
				data: {
					role: 'test', cmd: 'test', type: 'message', c: 'test'
				}
			}, function (err, result) {
				var wsClient = new WebSocketClient();
				var wsClient2 = new WebSocketClient();
				wsClient.connect('ws://127.0.0.1:10001', 'echo-protocol');
				wsClient2.connect('ws://127.0.0.1:10001', 'echo-protocol');

				wsClient2.on('connect', function (connection) {
					connection.on('message', function (message) {
						console.log(message);
					})
				})

				wsClient.on('connect', function (connection) {
					connection.sendUTF(JSON.stringify({ c: 'test'}));
				
					connection.on('message', function (message) {
						console.log(message);
						done();
					})
				})
			})
		})
	})
})