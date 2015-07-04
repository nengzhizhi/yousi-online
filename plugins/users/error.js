var util = require('util');

function error() {
	var error = this;

	error.InternalError = function(err){
		if (util.isString(err)) {
			return {
				code : 200000,
				detail : "Internal error:{0}"
			}
		} else {
			return {
				code : 200000,
				detail : 'Internal error'
			}
		}
	}

	error.InvalidUsername = function(err) {
		return {
			code : 200001,
			detail : 'Invalid username'
		}
	}

	error.InvalidPassword = function(err) {
		return {
			code : 200002,
			detail : 'Invalid password'
		}
	}

	error.UsernameUsed = function() {
		return {
			code : 200003,
			detail : 'Username is alereday in use!'
		}
	}

	error.PasswordDiffer = function(err) {
		return {
			code : 200004,
			detail : 'Password is differ with Confirm Password'
		}
	}

	error.UnknowRole = function(err) {
		return {
			code : 200005,
			detail : 'Unkown Role'
		}		
	}

	error.UsernamePasswordNotMatch = function(err){
		return {
			code : 200006,
			detail : 'Username and password does not match.'
		}			
	}

	error.VerifySignFail = function(err){
		return {
			code : 200007,
			detail : 'Sign failed!'
		}
	}

	return this;
}

module.exports = error;