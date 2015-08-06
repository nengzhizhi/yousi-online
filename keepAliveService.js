var seneca = require('seneca')();
var mongoose = require('mongoose');
mongoose.connect('mongodb://yousi:password@112.124.117.146:27017/yousi');
seneca.use('/plugins/keepAlive/main',{
	wsServerPort : 10001,
	stServerPort : 10002
});

seneca.listen({
	host : '127.0.0.1',
	port : '7001'
}).ready(function(){
	seneca.act({role: 'keepAlive', cmd: 'start'}, function (err, result) {
		console.log('Start start keep connection!');
	})
})