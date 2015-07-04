var crypto = require('crypto');
var usersModel = require('./model.js').usersModel;
var error = require('./error.js')();

module.exports = function(options) {
	var seneca = this;
	var key = 'qwxxxx1_xxx_wsx';

	seneca.options({strict:{result:false}})

	seneca.add({role:'users', cmd:'create'}, cmd_create);
	seneca.add({role:'users', cmd:'getUser'}, cmd_getUser);
	// seneca.add({role:'users', cmd:'checkLogin'}, cmd_checkLogin);
	// seneca.add({role:'users', cmd:'sign'}, cmd_sign);


	function cmd_create(args, callback){
		var user = usersModel();
		user.username = args.data.username;
		user.password = args.data.password;
		user.role = args.data.role;

		user.save(function (err) {
			callback(err, user);
		})
	}

	function cmd_getUser(args, callback){
		usersModel
		.findOne(args.data)
		.exec(function (err, result) {
			callback(err, result);
		});
	}

// 	function cmd_checkLogin(args, callback){
// 		if (args.data && args.data.cookies ) {
// 			var hmac = crypto.createHmac('sha1', key);
			
// 			var username = args.data.cookies.username;
// 			var role = args.data.cookies.role;
// 			var sign = args.data.cookies.sign;

// 			var str = new Buffer(username + role).toString('hex');

// 			hmac.update(str);
// 			if (hmac.digest('hex') == sign) {
// 				callback(null, {username : username, role : role});
// 			} else {
// 				callback(null, null);
// 			}
// 		} else{
// 			callback(null, null);
// 		}

// 		//callback(null, {username:'nengzhizhi',role:'student'});
// 	}

// 	function cmd_sign(args, callback){
// 		var hmac = crypto.createHmac('sha1', key);
// 		var username = args.data.username;
// 		var role = args.data.role;
// 		var str = new Buffer(username + role).toString('hex');
// 		hmac.update(str);
// 		callback(null, {val : hmac.digest('hex')});
// 	}
}