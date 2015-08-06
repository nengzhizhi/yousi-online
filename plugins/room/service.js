module.exports = function(options){
	var seneca = this;

	seneca.rooms = {};
	seneca.client({host: 'localhost', port: 7001, pin: {role:'keepAlive',cmd:'*'}});

	seneca.add({role: 'room', cmd: 'start'}, cmd_start);
	seneca.add({role: 'room', cmd: 'create'}, cmd_create);
	seneca.add({role: 'room', cmd: 'canEnter'}, cmd_canEnter);

	seneca.add({role: 'room', cmd: 'enter_message'}, cmd_enter_message);
	seneca.add({role: 'room', cmd: 'leave_message'}, cmd_enter_message);
		

	function cmd_start(args, callback){
		seneca.act({role: 'keepAlive', cmd: 'register', data: {
			role: 'room', cmd: 'enter', type: 'message', c: 'enter'
		}})
	}

	function cmd_create(args, callback){
		var username = args.data.username;
	}

	function cmd_enter_message(args, callback){
		var roomID = args.data.roomID;
		var token = args.data.token;
		var username = args.data.username;
		var role = args.data.role;

		if (_.isEmpty(seneca.rooms[roomID])) {
			seneca.rooms[roomID] = {};
		}

		var user = { username: username, role: role };
		var tokens = [];
		for (var key in seneca.rooms[roomID]) {
			tokens.push(key);
		}
		seneca.rooms[roomID][token] = user;
		seneca.act({role: 'keepAlive', cmd:'broadcast', data: {
			tokens: tokens, 
			msg: {c: 'enter_push', data: user }
		}})
		callback(null, null);
	}

	function cmd_canEnter(args, callback){

	}
}