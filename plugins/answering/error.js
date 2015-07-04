 function error () {
	var error = this;

	error.InternalError = function(err){
		return {
			code : 100000,
			//detail : 'Internal error:{0}'.format(err)
			detail : 'Internal error:{0}'
		}
	}

	error.RoomNotExist = function(){
		return {
			code : 100001,
			//detail : 'Room [id = {0}]  not exist.'.format(param.roomId)
			detail : 'Room [id = {0}]  not exist.'
		}
	}

	error.RoomIsBusy = function(){
		return {
			code : 100002,
			detail : 'Room is busy.'
		}
	}

	error.RoomIsClosed = function(){
		return {
			code : 100003,
			detail : 'Room is closed.'
		}		
	}

	error.PermissonDeny = function(){
		return {
			code : 100004,
			detail : 'Permisson deny'
		}
	}

	error.BadInput = function(){
		return {
			code : 100005,
			detail : 'Bad input!'
		} 
	}

	error.AlreadyCreated = function(){
		return {
			code : 100006,
			detail : 'Already create room.'
		}
	}

	return error;
}

module.exports = error;