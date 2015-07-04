var seneca = require('seneca')();
var mongoose = require('mongoose');
mongoose.connect('mongodb://yousi:password@112.124.117.146:27017/yousi');

seneca.use('/plugins/users/service');


/*
seneca.listen({
	host : '127.0.0.1',
	port : 1002
}).ready(function(){
	console.log('Answering service start success!');
})
*/

var signVal;

seneca.act({
	role:'users', 
	cmd:'sign', 
	data:{username:'test', role:'teacher'}
},function (err, result){
	signVal = result.sign;
	console.log(result);


	seneca.act({
		role : 'users',
		cmd : 'checkLogin',
		data : {
			cookies : {
				username : 'test',
				role : 'teacher',
				sign : signVal
			}
		}
	},function (err, result){
		console.log(result);
	})
});