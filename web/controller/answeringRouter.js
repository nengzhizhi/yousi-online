var async = require('async');
var request = require('request');
var express = require('express');
var answeringRouter = express.Router();

var RestApi = {
	getRooms : 'http://vgame.tv/api/answering/getRooms',
	enterRoom : 'http://vgame.tv/api/answering/enterRoom',
	leaveRoom : 'http://vgame.tv/api/answering/leaveRoom',
	getAnswerings : 'http://vgame.tv/api/answering/getAnswerings',
	getOperations : 'http://vgame.tv/api/answering/getOperations'
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

		res.render('answering/roomList', {rooms:result,user:req.signedCookies});
	});
});

answeringRouter.get('/answerings', function (req, res){
	request.post({
		url : RestApi.getAnswerings,
		headers : { Cookie : req.headers.cookie }
	},function (err, response, body){
		console.log(body);
		if(response.statusCode == 200) {
			var result = JSON.parse(body);

			res.render('answering/answerings', {answerings:result,user:req.signedCookies});
		}
	})
});

answeringRouter.get('/replay', function (req, res){
	res.render('answering/replay', {user:req.signedCookies});
})

answeringRouter.get('/classroom', function (req, res){
	res.render('answering/classroom', {user:req.signedCookies});
})

module.exports = answeringRouter;