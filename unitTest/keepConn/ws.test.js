var assert = require('assert');
var WebSocketClient = require('websocket').client;
var client_t = new WebSocketClient();
var client_s = new WebSocketClient();

describe("Ws", function(){
	describe("#addConnection", function(){
		it("返回正确的链接数量", function (done) {
			client_t.on('connect', function (connection) {
				connection.sendUTF(JSON.stringify({
					c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
				}))

				connection.sendUTF(JSON.stringify({
					c: 'unitTest.addWsConnection', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'teacher', username: '002' }
				}))

				connection.on('message', function (message) {
					console.log(message.utf8Data);
				})					
			})
			client_t.connect('ws://121.40.174.3:10001', 'echo-protocol');
		})
	})

	// describe("#broadcast", function(){
	// 	this.timeout(15000);

	// 	it("收到广播通知", function (done){
	// 		client_t.on('connect', function (connection) {
	// 			connection.sendUTF(JSON.stringify({
	// 				c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 			}))

	// 			connection.on('message', function (message) {
	// 				connection.sendUTF(JSON.stringify({
	// 					c: 'unitTest.broadcast', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'student', username: '001' }
	// 				}))						
	// 			})

	// 			client_s.on('connect', function (connection) {
	// 				connection.sendUTF(JSON.stringify({
	// 					c: 'enter', data: { roomId: '55b8c364d9d6eac7303adae9', role: 'teacher', username: '002' }
	// 				}))	

	// 				connection.on('message', function (message) {
	// 					var result = JSON.parse(message.utf8Data);
	// 					assert.equal(result.c, 'unitTest.broadcast');
	// 					done();
	// 				})				
	// 			})
	// 			client_s.connect('ws://121.40.174.3:10001', 'echo-protocol');

	// 		})
	// 		client_t.connect('ws://121.40.174.3:10001', 'echo-protocol');					
	// 	})	
	// })

	// describe("#enter", function(){
	// 	it("学生成功进入房间后，收到enter_push广播", function (done) {
	// 		client_t.on('connect', function (connection) {
	// 			connection.sendUTF(JSON.stringify({
	// 				c: 'enter',
	// 				data: {
	// 					roomId: 'xxxx-xxxx',
	// 					username: 'student',
	// 					role: 'student'
	// 				}
	// 			}));

	// 			connection.on('message', function (message) {
	// 				//console.log(message.utf8Data);
	// 				var result = JSON.parse(message.utf8Data);
	// 				assert.equal('enter_push', result.c);
	// 				done();
	// 			})
	// 		})
	// 		client_t.connect('ws://121.40.174.3:10001', 'echo-protocol');

	// 		client_s.on('connect', function (connection) {
	// 			connection.sendUTF(JSON.stringify({
	// 				c: 'enter',
	// 				data: {
	// 					roomId: 'xxxx-xxxx',
	// 					username: 'teacher',
	// 					role: 'teacher'
	// 				}
	// 			}));
	// 		})
	// 		client_s.connect('ws://121.40.174.3:10001', 'echo-protocol');			
	// 	})
	// })
})