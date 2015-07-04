var seneca = require('seneca')();
var async = require('async');


seneca.client({host:'127.0.0.1',port:1002,pin:{role:'answering',cmd:'*'}})
//创建房间单元测试
// seneca.act({
// 	role : 'answering',
// 	cmd : 'createRoom',
// 	data : {
// 		'teacher' : 'test'
// 	}
// }, function (error, result) {
// 	console.log('result = ' + result);
// });

for(var i = 0;i<1;i++){
	seneca.act({
		role : 'answering',
		cmd : 'addOperations',
		data : {
			answering : '559134cbceafa2502d71f0db',
			records : [
				{ data : 'test'},
				{ data : 'test'}
			],
			timestamp : Date.now()
		}
	}, function (error, result) {
		console.log('result = ' + JSON.stringify(result));
	});
}