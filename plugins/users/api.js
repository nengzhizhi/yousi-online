var async = require('async');
var error = require('./error.js')();
var Validator = require('schema-validator');

module.exports = function (options) {
	var seneca = this;
	var router = seneca.export('web/httprouter');

	seneca.act('role:web', {use:router(function (app) {
		app.post('/api/users/register', onRegister);
		app.post('/api/users/login', onLogin);
	})});

	seneca.use('/plugins/users/service');

	function onRegister(req, res){

		if(!req.body.username || !req.body.username.match(/([a-zA-Z0-9]){5,15}/g))
		{
			res.end(JSON.stringify(error.InvalidUsername()));
		} 
		else if(!req.body.password || !req.body.password.match(/((.){6,10})/g))
		{
			res.end(JSON.stringify(error.InvalidPassword()));
		}
		else if(!req.body.role || (req.body.role!='teacher' && req.body.role!='student')) 
		{
			res.end(JSON.stringify(error.UnknowRole()));
		} 
		else 
		{
			async.series({
				user : function (next) {
					seneca.act({
						role : 'users', cmd : 'getUser', 
						data : {
							username : req.body.username
						}
					}, function (err, result) {
						if (!result) {
							next(err, result);
						} else {
							next(JSON.stringify(error.UsernameUsed()), null);
						}
					})
				},
				create : function (next) {
					seneca.act({
						role : 'users', cmd : 'create', 
						data : {
							username : req.body.username,
							password : req.body.password,
							role : req.body.role
						}
					}, function (err, result) {
						if (err) {
							next(JSON.stringify(error.InternalError(err)), null);
						} 
						else {
							next(null, result);
						}
					})					
				}

			}, function (err, result) {
				if (err) {
					res.end(err);
				} else {
					res.end(JSON.stringify({code:200}));
				}
			})
		}
	}

	function onLogin(req, res){
		console.log(req);
		if (!req.body.username || !req.body.username.match(/([a-zA-Z0-9]){5,15}/g))
		{
			res.end(JSON.stringify(error.InvalidUsername()));
		}
		else if(!req.body.password || !req.body.password.match(/((.){6,10})/g))
		{
			res.end(JSON.stringify(error.InvalidPassword()));
		} 
		else 
		{
			async.series({
				user : function (next) {
					seneca.act({
						role : 'users', cmd : 'getUser', 
						data : {
							username : req.body.username,
							password : req.body.password
						}
					}, function (err, result) {
						next(err, result);
					})
				}
			}, function (err, result) {
				if (!result.user) 
				{
					res.end(JSON.stringify(error.UsernamePasswordNotMatch()));
				} 
				else if(err)
				{
					res.end(JSON.stringify(error.InternalError(err)));
				} 
				else 
				{
					res.cookie('username', req.body.username, {signed: true});
					res.cookie('role', result.user.role, {signed: true});

					res.end(JSON.stringify({
						code : 200,
						data : {
							username : req.body.username,
							role : result.user.role
						}
					}));
				}
			})
		}
	}
}