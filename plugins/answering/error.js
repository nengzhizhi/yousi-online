 function error () {
	var error = this;

	error.InternalError = function(err){
		return {
			code : 100000,
			//desc : 'Internal error:{0}'.format(err)
			desc : 'Internal error:{0}'
		}
	}

	error.RoomNotExist = function(){
		return {
			code : 100001,
			//desc : 'Room [id = {0}]  not exist.'.format(param.roomId)
			desc : 'Room [id = {0}]  not exist.'
		}
	}

	error.RoomIsBusy = function(){
		return {
			code : 100002,
			desc : 'Room is busy.'
		}
	}

	error.RoomIsClosed = function(){
		return {
			code : 100003,
			desc : 'Room is closed.'
		}		
	}

	error.PermissonDeny = function(){
		return {
			code : 100004,
			desc : 'Permisson deny'
		}
	}

	error.BadInput = function(){
		return {
			code : 100005,
			desc : 'Bad input!'
		} 
	}

	error.AlreadyCreated = function(){
		return {
			code : 100006,
			desc : 'Already create room.'
		}
	}

	error.NotLogin = function(){
		return {
			code: 100007,
			desc: 'Please login first!'
		}
	}

	error.AlreadyInRoom = function(){
		return {
			code: 100008,
			desc: 'Already enter in room!'
		}
	}

	error.ConcatAudioSliceFail = function(){
		return {
			code: 100009,
			desc: 'Concat audio slice fail!'
		}
	}

	return error;
}

module.exports = error;