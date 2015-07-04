var express = require('express');
var request = require('request');
var usersRouter = express.Router();
var seneca = require('seneca')();

seneca.use('../plugins/users/service');

var RestApi = {
	login : 'http://vgame.tv/api/users/login'
}


usersRouter.get('/home', function (req, res) {
	if (req.signedCookies && req.signedCookies.username) 
	{
		res.render('users/home', {user:req.signedCookies});
	}
	else
	{
		res.redirect('/users/login');
	}
});

usersRouter.get('/register', function (req, res) {
	res.render('users/register',{user:req.signedCookies});
});

usersRouter.get('/login', function (req, res) {
	res.render('users/login',{user:req.signedCookies});
});

usersRouter.get('/logout', function (req, res) {
	res.clearCookie('username');
	res.clearCookie('role');
	res.redirect('/users/login');
});

usersRouter.post('/login', function (req, res) {
	request.post(
		RestApi.login,
		{
			form : {
				username : req.body.username,
				password : req.body.password
			}
		},
		function (err, response, body) {
			var result = JSON.parse(body);
			if (result.status == 'success') {
				res.cookie('role', result.role?result.role:'', {signed:true});
				res.cookie('username', result.username?result.username:'', {signed:true});
				res.redirect('/users/home');
			} else {
				res.end('Login failed!');
			}
		}
	);
});

module.exports = usersRouter;