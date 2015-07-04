var error = require('./error.js')();
var async = require('async');

module.exports = function(options) {
	var seneca = this;
	var router = seneca.export('web/httprouter');

	seneca.act('role:web', {use:router(function (app){
		app.post('/api/answering/getRooms', onGetRooms);
		app.post('/api/answering/enterRoom', onEnterRoom);
		app.post('/api/answering/leaveRoom', onLeaveRoom);
		app.post('/api/answering/createRoom', onCreateRoom);
		app.post('/api/answering/closeRoom', onCloseRoom);
	})});

	seneca.use('/plugins/users/service');
	seneca.use('/plugins/answering/service');

	function onGetRooms(req, res){
		seneca.act({
			role : 'answering',cmd : 'getRooms',
			data : {}
		}, function (err, result){
			if (!err) {
				res.end(JSON.stringify(result));
			} else {
				res.end(JSON.stringify(error.InternalError(err)));
			}
		});
	}

	function onEnterRoom(req, res){
		req.checkBody('roomId', error.BadInput()).isObjectId();
		if (req.validationErrors()) {
			res.end(JSON.stringify(error.BadInput()));
			return;
		}


		var roomId = req.body.roomId, student, teacher, answeringId;

		if(!req.signedCookies || !req.signedCookies.username)
		{
			res.end(JSON.stringify(error.PermissonDeny()));
		}
		else if(req.signedCookies.role == 'teacher') 
		{
			seneca.act({
				role:'answering', cmd:'getRoom',
				data : {
					_id : roomId,
					teacher : req.signedCookies.username
				}
			}, function (err, result){
				if (err) {
					res.end(JSON.stringify(error.InternalError(err)));
				} else if(!result) {
					res.end(JSON.stringify(error.PermissonDeny()));
				} else {
					res.end(JSON.stringify({
						status : 'success',
						room : {
							roomId : result._id,
							teacher : result.teacher
						}
					}));
				}
			})
		}
		else if(req.signedCookies.role == 'student')
		{
			student = req.signedCookies.username;

			async.series({
				getRoom : function (next) {
					seneca.act({
						role : 'answering', cmd : 'getRoom',
						data : { _id : roomId }
					}, function (err, result){
						if (err) 
						{
							next(JSON.stringify(error.InternalError(err)), null);
						} 
						else if(!result) 
						{
							next(JSON.stringify(error.RoomNotExist()), null);
						}
						else if(result.student)
						{
							//已经进入房间
							if (result.student == student) {
								res.end(JSON.stringify({
									status : 'success',
									room : {
										roomId : result._id,
										teacher : result.teacher,
										student : result.student,
										answering : result.answeringId
									}
								}));
								return;							
							}
							//房间已被其它学生占用  
							else {
								next(JSON.stringify(error.RoomIsBusy()), null);
							}
						}
						//房间已关闭
						else if(result.status == 'closed' || result.status == 'answering')
						{
							next(JSON.stringify(error.RoomIsBusy()), null);
						} 
						else
						{
							teacher = result.teacher;
							next(null, result);
						}
					});
				},
				//创建答疑
				createAnswering : function (next) {
					seneca.act({
						role : 'answering', cmd : 'createAnswering',
						data : {
							teacher : teacher,
							student : student						
						}
					}, function (err, result){
						if (err || !result) 
						{
							next(JSON.stringify(error.InternalError(err)), null);
						}
						else 
						{
							answeringId = result._id;
							next(null, result);
						}
					});
				},
				//更新房间状态
				updateRoom : function (next) {
					seneca.act({
						role : 'answering', cmd : 'updateRoom',
						queryData : {
							_id : roomId
						},
						updateData : {
							student : student,
							answeringId : answeringId,
							status : 'answering'
						}
					}, function (err, result) {
						if (err || !result) {
							next(JSON.stringify(error.InternalError(err)), null);
						} else {
							next(null, result);
						}
					})
				}
			}, function (err, results) {
				if (err) {
					res.end(err);
				} else {
					res.end(JSON.stringify({
						status : 'success',
						room : {
							roomId : roomId,
							teacher : teacher,
							student : student,
							answering : results.createAnswering._id
						}
					}));
				}			
			});
		}
	}

	function onLeaveRoom(req, res){
		var roomId = req.body.roomId,student;

		if (!req.signedCookies || !req.signedCookies.username || req.signedCookies.role != 'student') 
		{
			res.end(JSON.stringify(error.PermissonDeny()));
		}
		else {
			student = req.signedCookies.username;

			async.waterfall([
				//获取房间信息
				function (next) {
					seneca.act({
						role:'answering', cmd:'getRoom',
						data : {
							_id : roomId,
							student : student
						}
					}, function (err, result) {
						if (err) {
							next(JSON.stringify(error.InternalError(err)), null);
						} else if(!result) {
							next(JSON.stringify(error.PermissonDeny()), null);
						} else {
							next(null, result);
						}
					})
				},
				//更新房间状态
				function (room, next) {
					seneca.act({
						role:'answering', cmd:'updateRoom',
						queryData : {
							_id : roomId
						},
						updateData : {
							student : null,
							status : 'waiting',
							answeringId : null
						}
					}, function (err, result) {
						if (err) {
							next(JSON.stringify(error.InternalError(err)), null)
						} else {
							next(null, result)
						}
					})
				}
			], function (err, results){
				if (err) {
					res.end(err);
				} else {
					res.end(JSON.stringify({status : 'success'}))
				}
			})
		}
	}
	function onCreateRoom(req, res){
		if(!req.signedCookies || !req.signedCookies.username || req.signedCookies.role != 'teacher')
		{
			res.end(JSON.stringify(error.PermissonDeny()));
		}
		else {
			async.series({
				getRoom : function(next){
					seneca.act({
						role:'answering', cmd:'getRoom',
						data:{
							teacher : req.signedCookies.username
						}
					}, function (err, result) {
						if (err) {
							next(JSON.stringify(error.InternalError(err)), null);
						} else if( result && result.status && result.status != 'closed'){
							next(JSON.stringify(error.AlreadyCreated()), null);
						} else {
							next(null,null);
						}
					})
				},
				createRoom : function(next){
					seneca.act({
						role : 'answering', cmd : 'createRoom',
						data : {
							teacher : req.signedCookies.username,
							status : 'waiting',
							type : 'answering'
						}
					}, function (err, result) {
						if (err) 
						{
							next(JSON.stringify(error.InternalError(err)), null);
						} 
						else {
							next(null, result);
						}
					})
				}
			}, function (err, results){
				if (results.createRoom) {
					res.end(JSON.stringify({
						status : 'success',
						roomId : results.createRoom._id
					}));					
				} else if(err) {
					res.end(err);
				} else {
					res.end(JSON.stringify({status:'fail'}));
				}
			});
		}
	}

	function onCloseRoom(req, res){

		if(!req.signedCookies || !req.signedCookies.username || req.signedCookies.role != 'teacher')
		{
			res.end(JSON.stringify(error.PermissonDeny()));
		}
		else 
		{
			async.series({
				updateRoom : function (next) {
					seneca.act({
						role : 'answering', cmd : 'updateRoom',
						queryData : {
							_id : req.body.roomId,
							teacher : req.signedCookies.username
						},
						updateData : {
							status : 'closed'
						}
					}, function (err, result){
						if (err) {
							next(JSON.stringify(error.InternalError(err)), null);
						} else {
							next(null, result);
						}
					});
				}
			}, function (err, results){
				if (err) {
					res.end(err);
				} else {
					res.end(JSON.stringify({status : 'success'}));
				}
			})
		}
	}	
}