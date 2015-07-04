var async = require('async');
var request = require('request');
var express = require('express');
var answeringRouter = express.Router();

var RestApi = {
	getRooms : 'http://vgame.tv/api/answering/getRooms',
	enterRoom : 'http://vgame.tv/api/answering/enterRoom',
	leaveRoom : 'http://vgame.tv/api/answering/leaveRoom'
};

answeringRouter.get('/leaveRoom', function (req, res) {
	request.post({
			url : RestApi.leaveRoom,
			headers : { Cookie : req.headers.cookie },
			form : { roomId : req.query.id }
		}, function (err, response, body) {
			console.log(JSON.parse(body));
			if (JSON.parse(body).status == 'success') {
				res.redirect('/answering/rooms');
			} else {
				res.end('leaveRoom failed!');
			}
		}
	);
});

answeringRouter.get('/room', function (req, res) {
	request.post({
		url : RestApi.enterRoom,
		headers : { Cookie : req.headers.cookie },
		form : { roomId : req.query.id }
	}, function (err, response, body){
		try {
			var result = JSON.parse(body);

			if (result.status == 'success') {
				if (req.signedCookies.role == 'student') {
					res.render('answering/room_s', {room : result.room,user:req.signedCookies});
				} else if(req.signedCookies.role == 'teacher') {
					res.render('answering/room_t', {room : result.room,user:req.signedCookies});
				}
			} else{
				res.end('error : enterRoom failed!');
			}
		}catch(e){}
	})
});

answeringRouter.get('/rooms', function (req, res) {
	request.post({
		url : RestApi.getRooms,
		form : {}
	},function (err, response, body) {
		var result = JSON.parse(body);

		if (result) {
			res.render('answering/roomList', {rooms:result,user:req.signedCookies});
		} else {
			res.end();
		}
	});
});
module.exports = answeringRouter;