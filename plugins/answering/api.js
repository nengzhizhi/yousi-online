var error = require('./error.js')();
var async = require('async');
var querystring = require('querystring');
var qiniu = require('qiniu');
var _ =require('lodash');

module.exports = function(options) {
	var seneca = this;
	var router = seneca.export('web/httprouter');

	seneca.act('role:web', {use:router(function (app){
		app.post('/api/answering/getRooms', onGetRooms);
		app.post('/api/answering/openRoom', onOpenRoom);
		app.post('/api/answering/closeRoom', onCloseRoom);				
		app.post('/api/answering/enterRoom', onEnterRoom);
		app.post('/api/answering/getRoomByUsername', onGetRoomByUsername);

		app.post('/api/answering/getAnswerings', onGetAnswerings);
		app.post('/api/answering/getAnswering', onGetAnswering);
		app.post('/api/answering/getOperations', onGetOperations);

		app.post('/api/answering/addAudioSlice', onAddAudioSlice);
		app.post('/api/answering/concatAudioSlice', onConcatAudioSlice);
		app.post('/api/answering/concatCallback', onConcatCallback);
	})});

	seneca.use('/plugins/users/service');
	seneca.use('/plugins/answering/service');

	/**
	 * Description:  获取房间列表
	 *
	**/
	function onGetRooms(req, res){
		seneca.act({
			role: 'answering', cmd: 'getRooms'
		}, function (err, result){
			if (!err) {
				res.end(JSON.stringify({code: 200, data: result}));
			} else {
				res.end(JSON.stringify(error.InternalError(err)));
			}
		});
	}

	/**
	 * 房间状态
	 *
	 * closed		关闭
	 * waiting		老师在房间中，等待学生进入答疑	
	 * empty		房间开启，没有老师，没有学生
	 * answering 	正在进行答疑
	 * pending		老师或学生异常退出，等待老师或学生重新进入
	 *
	**/

	/**
	 * Description: 开启房间
	 *
	 * @param roomId: 房间编号
	 *
	**/

	function onOpenRoom(req, res) {
		req.body.roomId && req.sanitize('roomId').escape().trim();
		req.checkBody('roomId', '').isObjectId();

		if (req.validationErrors()) {
			res.end(JSON.stringify(error.BadInput()));
			return;
		}

		if (!req.signedCookies || req.signedCookies.role != 'teacher') {
			res.end(JSON.stringify(error.PermissonDeny()));
		}

		seneca.act({
			role: 'answering', cmd: 'openRoom',
			data: {
				roomId: req.body.roomId,
				role: req.signedCookies.role,
				username: req.signedCookies.username
			}
		}, function (err, result){
			res.end(JSON.stringify({ code: 200 }));
		})
	}

	/**
	 * Description: 关闭房间
	 *
	 * @param roomId: 房间编号
	 *
	**/

	function onCloseRoom(req, res) {
		req.body.roomId && req.sanitize('roomId').escape().trim();
		req.checkBody('roomId', '').isObjectId();

		if (req.validationErrors()) {
			res.end(JSON.stringify(error.BadInput()));
			return;
		}

		if (!req.signedCookies || req.signedCookies.role != 'teacher') {
			res.end(JSON.stringify(error.PermissonDeny()));
		}

		seneca.act({
			role: 'answering', cmd: 'closeRoom',
			data: {
				roomId: req.body.roomId,
				role: req.signedCookies.role,
				username: req.signedCookies.username
			}
		}, function (err, result){
			if (err || !result) {
				res.end(JSON.stringify(error.PermissonDeny()));
			} else {
				res.end(JSON.stringify({ code: 200 }));
			}
		})
	}

	function onEnterRoom (req, res) {
		req.body.roomId && req.sanitize('roomId').escape().trim();
		req.checkBody('roomId', '').isObjectId();

		if (req.validationErrors())
			return res.end(JSON.stringify(error.BadInput()));

		if (!req.signedCookies || !req.signedCookies.username)
			return res.end(JSON.stringify(error.NotLogin()));

		if (req.signedCookies.role == 'teacher' || req.signedCookies.role == 'student') {
			async.waterfall([
				function (next) {
					seneca.act({
						role: 'answering', cmd: 'takeAction',
						data: {
							action: 'enter',
							roomId: req.body.roomId,
							role: req.signedCookies.role,
							username: req.signedCookies.username
						}
					}, next)
				}
			], function (err, result) {
				if (result.status == 'success') {
					seneca.act({
						role: 'answering', cmd: 'getRoom',
						data: { _id: req.body.roomId }
					}, function (err, result) {
						if (err || _.isEmpty(result.data) || result.status == 'fail') {
							res.end(JSON.stringify(error.PermissonDeny()));
						} else {
							res.end(JSON.stringify({
								code: 200,
								data: { room: { roomId: result.data._id } }
							}));
						}
					})					
				}
				else {
					return res.end(JSON.stringify(error.PermissonDeny()));
				}
			})
		} else {
			return res.end(JSON.stringify(error.PermissonDeny()));
		}
	}

	/**
	 * Description: 获取房间信息
	 *
	 * @param roomId: 房主用户名
	 *
	**/
	function onGetRoomByUsername(req, res){
		req.body.username && req.sanitize('username').escape().trim();
		//req.checkBody('roomId', '').isUsername();

		seneca.act({
			role: 'answering', cmd: 'getRoom',
			data: {
				owner: req.body.username
			}
		}, function (err, result) {
			if (!_.isEmpty(err) || _.isEmpty(result.data) || result.status == 'fail')
				res.end(JSON.stringify(error.PermissonDeny()));
			else
				res.end(JSON.stringify({
					code: 200, 
					data: {
						room: {
							id: result.data._id,
							teacher: result.data.teacher,
							status: result.data.status
						}
					}
				}));			
		})
	}

	function onGetAnswering (req, res) {
		req.body.id && req.sanitize('id').escape().trim();
		req.checkBody('id', '').isObjectId();

		if(!req.signedCookies) {
			res.end(JSON.stringify(error.PermissonDeny()));
			return;
		}		

		var queryData = {};
		queryData._id = req.body.id;
		if (req.signedCookies.role == 'teacher') {
			queryData.teacher = req.signedCookies.username;
		} else if(req.signedCookies.role == 'student') {
			queryData.student = req.signedCookies.username;
		} else {
			res.end(JSON.stringify(error.PermissonDeny()));
		}

		seneca.act({
			role: 'answering', cmd: 'getAnswering',
			data: queryData
		}, function (err, result) {
			if (!_.isEmpty(err) || _.isEmpty(result)) {
				res.end(JSON.stringify(error.PermissonDeny()));
			} else {
				res.end(JSON.stringify({code: 200, data: result}));
			}
		})
	}

	function onGetAnswerings(req, res){
		if(!req.signedCookies || !req.signedCookies.username) {
			res.end(JSON.stringify(error.PermissonDeny()));
		}else{
			var queryData;
			if (req.signedCookies.role == 'teacher') {
				queryData = {teacher:req.signedCookies.username};
			} else if(req.signedCookies.role == 'student') {
				queryData = {student:req.signedCookies.username};
			} else {
				return res.end(JSON.stringify(error.PermissonDeny));
			}
			//queryData.savingStatus = 'success';

			seneca.act({
				role:'answering', cmd:'getAnswerings',
				data : queryData
			}, function (err, result){
				if(err){
					return res.end(error.InternalError(err));
				} else {
					return res.end(JSON.stringify({code: 200, data: result}));
				}
			});
		}
	}

	function onGetOperations(req, res){
		//TODO check permission
		req.checkBody('answeringId', error.BadInput()).isObjectId();
		// req.checkBody('start', error.BadInput()).isInteger();
		// req.checkBody('count', error.BadInput()).isInteger();

		if (req.validationErrors()) {
			return res.end(JSON.stringify(error.BadInput()));
		// } else if(!req.signedCookies || !req.signedCookies.username){
		// 	res.end(JSON.stringify(error.PermissonDeny()));
		} else {
			seneca.act({
				role:'answering', cmd:'getOperations',
				data:{
					answeringId : req.body.answeringId,
					start : req.body.start,
					count : req.body.count
				}
			}, function (err, result) {
				if (err) {
					res.end(JSON.stringify(err));
				} else {
					res.end(JSON.stringify({code:200, data:result}));
				}
			})
		}
	}

	//保存音频片段
	function onAddAudioSlice (req, res) {
		//TODO check permission
		req.body.answeringId && req.sanitize('answeringId').escape().trim();
		req.checkBody('answeringId', '').isObjectId();
		req.body.key && req.sanitize('key').escape().trim();
		req.checkBody('key', '').isTimeStamp();

		seneca.act({
			role: 'answering', cmd: 'addAudioSlice',
			data: {
				key: req.body.key,
				answeringId: req.body.answeringId
			}
		}, function (err, result) {
			if (err || _.isEmpty(result)) {
				res.end(JSON.stringify(err));
			} else {
				res.end(JSON.stringify({ code: 200 }));
			}
		})
	}

	//拼接音频片段，拼接完成删除片段，更新答疑状态
	function onConcatAudioSlice (req, res) {
		req.body.answeringId && req.sanitize('answeringId').escape().trim();
		req.checkBody('answeringId', '').isObjectId();

		if (req.validationErrors()) {
			res.end(JSON.stringify(error.BadInput()));
			return;
		}

		seneca.act({
			role: 'answering', cmd: 'concatAudioSlice',
			data: { answeringId: req.body.answeringId }
		}, function (err, result) {
			if (err || _.isEmpty(result) || result.status != 'success') {
				res.end(JSON.stringify(error.ConcatAudioSliceFail()));
			} else {
				res.end(JSON.stringify({ code: 200 }));
			}
		})
	}

	function onConcatCallback (req, res) {
		//检查来源
		console.log("answeringId = " + req.query.id);
		console.log(req.body);
		req.query.id && req.sanitize('id').escape().trim();
		req.checkQuery('id', 'invalid answeringId').isObjectId();

		if (req.validationErrors()) {
			res.end(JSON.stringify(error.BadInput()));
			return;			
		}	

		if (req.body.code == 0) {
			//合并成功
			async.waterfall([
				function (next) {
					//更新concat后音频文件名
					seneca.act({
						role: 'answering', cmd: 'updateAnswering',
						queryData: { _id: req.query.id },
						updateData: { 
							savingStatus: 'success', 
							audio: 'http://7xkjiu.media1.z0.glb.clouddn.com/' + req.body.items[0].key }
					}, next)
				}, function (result, next) {
					//更新音频状态
					seneca.act({
						role: 'answering', cmd: 'updateAudioSlice',
						queryData: { answeringId: req.query.id },
						updateData: { status: 'concated' }
					}, next)
				}
			], function (err, result) {
				if (err || _.isEmpty(result)) {
					res.end();
				} else {
					res.end(JSON.stringify({ code: 200 }));
				}
			})
		} else {
			res.end(JSON.stringify(error.ConcatAudioSliceFail()));
		}
	}
}