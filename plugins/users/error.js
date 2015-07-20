var util = require('util');

function error() {
	var error = this;

	error.InternalError = function(err){
		if (util.isString(err)) {
			return {
					code : 200000,
					desc : "Internal error:{0}"
			}
		} else {
			return {
					code : 200000,
					desc : 'Internal error'
			}
		}
	}

	error.InvalidUsername = function(err) {
		return {
				code : 200001,
				desc : 'Invalid username'
		}
	}

	error.InvalidPassword = function(err) {
		return {
			code : 200002,
			desc : 'Invalid password'
		}
	}

	error.UsernameUsed = function() {
		return {
			code : 200003,
			desc : 'Username is alereday in use!'
		}
	}

	error.UnknowRole = function(err) {
		return {
			code : 200004,
			desc : 'Unkown Role'
		}		
	}

	error.UsernamePasswordNotMatch = function(err){
		return {
			code : 200005,
			desc : 'Username and password does not match.'
		}			
	}

	return this;
}

module.exports = error;