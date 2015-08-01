var seneca = require('seneca')();
var mongoose = require('mongoose');
mongoose.connect('mongodb://yousi:password@112.124.117.146:27017/yousi');
seneca.use('/plugins/keepConn/service',{
	wsServerPort : 10001,
	stServerPort : 10002
});

// seneca.listen({
// 	host : '127.0.0.1',
// 	port : '1002'
// }).ready(function(){
// 	console.log('keepConn service start success!');
// 	seneca.act({
// 		role : 'keepConn',
// 		cmd : 'create'
// 	}, function (){
// 		console.log('keepConn service create success!');
// 	})
// })


seneca
.listen({host: 'localhost', port: 20003})
.ready(function(){
	// seneca.act({
	// 	role : 'keepConn',
	// 	cmd : 'initWsService'
	// }, function (err, result) {
	// 	console.log('Start initWsService result = ' + result);
	// });

	// seneca.act({
	// 	role : 'keepConn',
	// 	cmd : 'initStService'
	// }, function (err, result) {
	// 	console.log('Start initStService');
	// })

	seneca.act({role: 'keepConn', cmd: 'init'}, function (err, result) {
		console.log('Start init keep connection!');
	})
});