var async = require('async');
var error = require('./error.js')();
var Validator = require('schema-validator');
var _ = require('lodash');

module.exports = function (options) {
	var seneca = this;
	var router = seneca.export('web/httprouter');

	seneca.act('role:web', {use:router(function (app) {
		app.post('/api/users/register', onRegister);
		app.post('/api/users/login', onLogin);
	})});

	seneca.use('/plugins/users/service');
	seneca.use('/plugins/answering/service');

	function onRegister(req, res){
		req.body.username && req.sanitize('username').escape().trim();
		req.checkBody('username', '').isUsername();
		if (req.validationErrors()) {
			res.end(JSON.stringify(error.InvalidUsername()));
			return;
		}

		req.body.password && req.sanitize('password').escape().trim();
		req.checkBody('password', '').isPassword();
		if (req.validationErrors()) {
			res.end(JSON.stringify(error.InvalidPassword()));
			return;
		}

		req.checkBody('role', '').isRole();
		if (req.validationErrors()) {
			res.end(JSON.stringify(error.UnknowRole()));
			return;
		}		

		async.series({
			user: function (next) {
				seneca.act({
					role: 'users', cmd: 'getUser', data: {
						username : req.body.username
					}
				}, function (err, result) {
					if (!result) next(err, result);
					else next(JSON.stringify(error.UsernameUsed()), null);
				})
			}, 
			create: function (next) {
				seneca.act({
					role: 'users', cmd: 'create', data: {
						username: req.body.username,
						password: req.body.password,
						role: req.body.role
					}
				}, function (err, result) {
					next(err ? JSON.stringify(err) : null, result);
				})
			}
		}, function (err, result) {
			if (req.body.role == 'teacher') {
				seneca.act({
					role: 'answering', cmd: 'createRoom', data: {
						teacher: req.body.username
					}})
			}
			var val = _.isEmpty(err) ? error.InternalError() : { code: 200 };
			res.end(JSON.stringify(val));
		})
	}

	function onLogin(req, res){
		req.body.username && req.sanitize('username').escape().trim();
		req.checkBody('username', '').isUsername();
		if (req.validationErrors()) {
			res.end(JSON.stringify(error.InvalidUsername()));
			return;
		}

		req.body.password && req.sanitize('password').escape().trim();
		req.checkBody('password', '').isPassword();
		if (req.validationErrors()) {
			res.end(JSON.stringify(error.InvalidPassword()));
			return;
		}

		async.series({
			user: function (next) {
				seneca.act({
					role: 'users', cmd: 'getUser', data: {
						username: req.body.username,
						password: req.body.password
					}
				}, function (err, result) {
					next(err, result);
				})
			}
		}, function (err, result) {
			if (!result.user) res.end(JSON.stringify(error.UsernamePasswordNotMatch()));
			else if(err)
				res.end(JSON.stringify(error.InternalError(err)));
			else {
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