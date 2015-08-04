var net = require('net');
var seneca = require('seneca')();
var WebSocketClient = require('websocket').client;

seneca.use('../../plugins/keepConn/main', {});

describe("Main.js", function(){
	// describe('#addToRoom', function(){
	// 	it("single", function (done) {
	// 		seneca.act({role: 'keepConn', cmd: 'debug', data: {
	// 			func: 'addToRoom',
	// 			roomID: 'roomID:xxxx-xxxx-xxxx',
	// 			token: 'token:xxxx-xxxx-xxxx',
	// 			user: { username: 'nengzhizhi'}
	// 		}}, function (err, result) {
	// 			console.log(result)
	// 			done();
	// 		})
	// 	})

	// 	it("multiple", function (done) {
	// 		seneca.act({role: 'keepConn', cmd: 'debug', data: {
	// 			func: 'addToRoom',
	// 			roomID: 'roomID:xxxx-xxxx-xxxx',
	// 			token: 'token:xxxx-xxxx-xxxx',
	// 			user: { username: 'nengzhizhi'}
	// 		}}, function (err, result) {
	// 			seneca.act({role: 'keepConn', cmd: 'debug', data: {
	// 				func: 'addToRoom',
	// 				roomID: 'roomID:xxxx-xxxx-xxxx',
	// 				token: 'token:xxxx-xxxx-xxxx1',
	// 				user: { username: 'nengzhizhi2'}
	// 			}}, function (err, result) {
	// 				console.log(result)
	// 				done();
	// 			})
	// 		})
	// 	})		
	// })

	// describe('#removeFromRoom', function(){
	// 	before(function (done) {
	// 		seneca.act({role: 'keepConn', cmd: 'debug', data: {
	// 			func: 'addToRoom',
	// 			roomID: 'roomID:xxxx-xxxx-xxxx',
	// 			token: 'token:xxxx-xxxx-xxxx',
	// 			user: { username: 'nengzhizhi'}
	// 		}}, function (err, result){
	// 			done();
	// 		})
	// 	})
	// 	it("ok", function (done) {
	// 		seneca.act({role: 'keepConn', cmd: 'debug', data: {
	// 			func: 'removeFromRoom',
	// 			roomID: 'roomID:xxxx-xxxx-xxxx',
	// 			token: 'token:xxxx-xxxx-xxxx'
	// 		}}, function(err, result){
	// 			console.log("result = " + JSON.stringify(result));
	// 			done();
	// 		})
	// 	});
	// })


	describe("#broadcast", function(){
		it("ok", function (done){
			var wsClient = new WebSocketClient();
			wsClient.connect('ws://127.0.0.1:10001', 'echo-protocol');
			wsClient.on('connect', function (connection) {
				connection.sendUTF(JSON.stringify({
					c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
				}));

				connection.on('message', function (message){
					console.log('message = ' + message.utf8Data);
				})
			})


			var client = net.connect({port: 10002}, function(){
				client.write(JSON.stringify({
					c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
				}));
			});

			client.on('data', function (data) {
				console.log('data = ' + data.toString());
				if (data.toString().indexOf('enter_push') > 0) {
					client.write(JSON.stringify({
						c: 'draw', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
					}));
				}
				//done();
			})	
		})
	})

	// describe("#enter", function (){
	// 	it("ok", function (done) {
	// 		var wsClient = new WebSocketClient();
	// 		wsClient.connect('ws://127.0.0.1:10001', 'echo-protocol');
	// 		wsClient.on('connect', function (connection) {
	// 			connection.sendUTF(JSON.stringify({
	// 				c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 			}));
	// 		})


	// 		var client = net.connect({port: 10002}, function(){
	// 			client.write(JSON.stringify({
	// 				c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 			}));
	// 		});

	// 		client.on('data', function (data) {
	// 			console.log(data.toString());
	// 			//done();
	// 		})			
	// 	})
	// })

	// describe("#close", function (){
	// 	it("ok", function (done) {
	// 		var wsClient = new WebSocketClient();
	// 		wsClient.on('connect', function (connection) {
	// 			connection.sendUTF(JSON.stringify({
	// 				c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 			}));
	// 		})
	// 		wsClient.connect('ws://127.0.0.1:10001', 'echo-protocol');
	// 	})		
	// })

	// describe("#leave", function () {
	// 	it("ok", function (done) {
	// 		var wsClient = new WebSocketClient();
	// 		var c;
	// 		wsClient.on('connect', function (connection) {
	// 			c = connection;
	// 			c.sendUTF(JSON.stringify({
	// 				c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 			}));

	// 			c.on('message', function (message) {
	// 				console.log('message');
	// 				var data = JSON.parse(message.utf8Data);
	// 				if (data.c == 'enter_push') {
	// 					c.sendUTF(JSON.stringify({
	// 						c: 'leave', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 					}));
	// 				}
	// 			})				
	// 		})

	// 		wsClient.connect('ws://127.0.0.1:10001', 'echo-protocol');	
	// 	})
	// })

	// describe('#draw', function(){
	// 	it("ok", function (done) {
	// 		var wsClient = new WebSocketClient();
	// 		wsClient.on('connect', function (connection) {
	// 			connection.sendUTF(JSON.stringify({
	// 				c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 			}));

	// 			connection.on('message', function (message) {
	// 				console.log('message');
	// 				var data = JSON.parse(message.utf8Data);
	// 				if (data.c == 'enter_push') {
	// 					connection.sendUTF(JSON.stringify({
	// 						c: 'draw', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 					}));
	// 				}					
	// 			})
	// 		})
	// 		wsClient.connect('ws://127.0.0.1:10001', 'echo-protocol');
	// 	})
	// })
})