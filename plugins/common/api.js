var qiniu = require('qiniu');
var http = require('http');
var crypto = require('crypto');

module.exports = function (options) {
	var seneca = this;
	var router = seneca.export('web/httprouter');

	qiniu.conf.ACCESS_KEY = 'zQKgGIPr-OBfpGn82vgqGF8iPeZO6qwO9LMtaJsk';
	qiniu.conf.SECRET_KEY = '5FFoL8KBg-9l1AMEoaXIuIjKbqYlgn0eJ_y7LNhn';

	seneca.act('role:web', {use:router(function (app) {
		app.get('/api/common/upload/token', onUploadToken);
	})});

	//TODO 上传时检查权限
	function onUploadToken(req, res){
		var putPolicy = new qiniu.rs.PutPolicy('soundstest');

		//token的有效时间
		putPolicy.deadline = Date.now()/1000 + 7200;
		//putPolicy.expires = 60;

		res.end(JSON.stringify({'uptoken':putPolicy.token()}));
	}

	// function onConcatAudio(req, res){
	// 	var signStr = "/pfop/avconcat/1/format/ogg/";

	// 	var fops = 'avconcat/1/format/ogg';
	// 	var part[0] = new Buffer('http://7xkjiu.media1.z0.glb.clouddn.com/hmjz.mp3').toString('base64');
	// 	var part[1] = new Buffer('http://7xkjiu.media1.z0.glb.clouddn.com/4.mp3').toString('base64');
	// 	fops = fops + '/' + part[0] + '/' + part[1];

	// 	var postData = querystring.stringify({
	// 		bucket: 'sounds',
	// 		key: '2.ogg',
	// 		fops: fops
	// 	})

	// 	var signStr = '/pfop/\n' + postData;
	// 	var sign = crypto
	// 				.createHmac('sha1', qiniu.conf.SECRET_KEY)
	// 				.update(signStr)
	// 				.digest()
	// 				.toString('base64');
	// 	var accessToken = qiniu.conf.ACCESS_KEY + ':' + sign;

	// 	var options = {
	// 		hostname: 'api.qiniu.com',
	// 		port: 80,
	// 		path: '/pfop',
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/x-www-form-urlencoded',
	// 			'Content-Length': postData.length,
	// 			'Authorization': 'QBox ' + accessToken
	// 		}
	// 	}
	// }
}