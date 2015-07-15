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

	error.PasswordDiffer = function(err) {
		return {
			code : 200004,
			desc : 'Password is differ with Confirm Password'
		}
	}

	error.UnknowRole = function(err) {
		return {
			code : 200005,
			desc : 'Unkown Role'
		}		
	}

	error.UsernamePasswordNotMatch = function(err){
		return {
			code : 200006,
			desc : 'Username and password does not match.'
		}			
	}

	error.VerifySignFail = function(err){
		return {
			code : 200007,
			desc : 'Sign failed!'
		}
	}

	return this;
}

module.exports = error;