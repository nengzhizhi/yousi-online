var seneca = require('seneca')();

module.exports = function(options){
	var seneca = this;

	seneca.client({host: 'localhost', port: 7001, pin: {role:'keepAlive',cmd:'*'}});

	seneca.add({role: 'test', cmd: 'test'}, function (args, callback){
		seneca.act({role: 'keepAlive', cmd: 'broadcast', data: { tokens: [args.data.token], msg: 'hello'}})
		callback();
	})
}