var util = require('util');

function error() {
	var error = this;

	error.InternalError = function(err){
		return {
				code : 200011,
				desc : 'InternalError'
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