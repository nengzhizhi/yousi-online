var async = require('async');
var request = require('request');
var express = require('express');
var answeringRouter = express.Router();

var RestApi = {
	getRooms : 'http://localhost/api/answering/getRooms',
	enterRoom : 'http://localhost/api/answering/enterRoom',
	leaveRoom : 'http://localhost/api/answering/leaveRoom',
	getAnswerings : 'http://localhost/api/answering/getAnswerings',
	getOperations : 'http://localhost/api/answering/getOperations'
};


//---------------------------test----------------------------------
answeringRouter.get('/test', function (req, res){
	res.render('answering/student');
})

answeringRouter.get('/upload', function (req, res){
	res.render('answering/upload', {user:req.signedCookies})
})

//-----------------------------------------------------------------

answeringRouter.get('/leaveRoom', function (req, res) {
	request.post({
		url : RestApi.leaveRoom,
		headers : { Cookie : req.headers.cookie },
		form : { roomId : req.query.id }
	}, function (err, response, body) {
		if (response.statusCode == 200) {
			var result = JSON.parse(body);

			if (result.code == 200) {
				res.redirect('/answering/rooms');
			}
		} else {
			res.end('service unavailable!');
		}
	});
});

answeringRouter.get('/room', function (req, res) {
	request.post({
		url : RestApi.enterRoom,
		headers : { Cookie : req.headers.cookie },
		form : { roomId : req.query.id }
	}, function (err, response, body){
		if (response.statusCode == 200) {
			var result;
			if (body && typeof(body) === 'string') {
				result = JSON.parse(body);
			
				if (result.code == 200) {
					if (req.signedCookies.role == 'student')
						res.render('answering/classroom_s', {room:result.data.room, user:req.signedCookies});
					else if(req.signedCookies.role == 'teacher')
						res.render('answering/classroom', {room:result.data.room,user:req.signedCookies});
				} else {
					res.end('enterRoom failed!');
				}
			}
		} else {
			res.end('service unavailable!');
		}
	})
});

answeringRouter.get('/rooms', function (req, res) {
	request.post({
		url : RestApi.getRooms,
		form : {}
	},function (err, response, body) {
		if (response.statusCode == 200) {
			var result;
			if (body && typeof(body) === 'string') {
				result = JSON.parse(body);
			}

			res.render('answering/roomList', {rooms : result.data, user : req.signedCookies});
		} else {
			res.end('service unavailable!');
		}
	});
});

answeringRouter.get('/answerings', function (req, res){
	request.post({
		url : RestApi.getAnswerings,
		headers : { Cookie : req.headers.cookie }
	},function (err, response, body){
		if(response.statusCode == 200) {
			var result = body ? JSON.parse(body) : {};

			res.render('answering/answerings', {answerings:result.data, user:req.signedCookies});
		}
	})
});

answeringRouter.get('/replay', function (req, res){
	//TODO check req.query.id
	if (!req.query.id) {
		res.redirect('404');
	} else {
		res.render('answering/replay', {room:{answeringId:req.query.id}, user:req.signedCookies});
	}
})

module.exports = answeringRouter;