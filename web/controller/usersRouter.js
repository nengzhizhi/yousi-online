var express = require('express');
var request = require('request');
var usersRouter = express.Router();
var seneca = require('seneca')();

seneca.use('../plugins/users/service');

var RestApi = {
	login: 'http://121.40.174.3/api/users/login',
	getRoom: 'http://121.40.174.3/api/answering/getRoom'
}


usersRouter.get('/home', function (req, res) {
	if (req.signedCookies && req.signedCookies.username) {
		request.post({
				url: RestApi.getRoom,
				headers : { Cookie : req.headers.cookie }
			}, function (err, response, body) {
				if (response.statusCode == 200) {
					var result = JSON.parse(body);
					if (result.code == 200) {
						res.render(
							'users/home', 
							{ 
								user: req.signedCookies, 
								room: result.data.room 
							}
						);
						return;
					}
				}
				res.render('users/home', {user: req.signedCookies, room: {}});
			}
		)
	}
	else{
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
			if (response.statusCode == 200) {
				if (body && 'string' === typeof(body)){
					var result = JSON.parse(body);
				}

				if (result && result.code == 200) {
					res.cookie('role', (result.data && result.data.role) ? result.data.role : '', { signed : true });
					res.cookie('username', (result.data && result.data.username) ? result.data.username : '', { signed : true });
					res.redirect('/users/home');
				} else {
					res.end('login failed!');
				}
			} else {
				res.end('service unaviable!');
			}
		}
	);
});

module.exports = usersRouter;