var async = require('async');
var WSClient = require('websocket').client;

//var seneca = require('seneca')();

var client = new WSClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function (connection) {
	console.log('WebSocket Client Connected');
	connection.sendUTF(JSON.stringify({
		c : 'join',
		data : {
			roomId : '1001'
		}
	}));

	connection.on('message', function (message) {
		if (message.type == 'utf8') {
			try {
				var req = JSON.parse(message.uft8Data);

				if ( req.c == 'join') {
					if (req.data.result == 'success') {

					} else {
						console.log('join room failed!');
					}
				}
			} catch(e){}
		}
	})
});

client.connect('ws://127.0.0.1:10001/', 'echo-protocol');


// async.waterfall([
// 	function (next) {
		
// 	},
// 	function (result, next) {

// 	}
// ], function (error, result){

// });