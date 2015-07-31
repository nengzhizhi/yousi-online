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
		app.post('/api/answering/getRoom', onGetRoom);

		app.post('/api/answering/leaveRoom', onleaveRoom);
		app.post('/api/answering/closeRoom', onCloseRoom);
		app.post('/api/answering/getAnswerings', onGetAnswerings);
		app.post('/api/answering/getOperations', onGetOperations);

		app.post('/api/answering/addAudioSlice', onAddAudioSlice);
		app.post('/api/answering/concatAudioSlice', onConcatAudioSlice);
		app.get('/api/answering/concatFinishCallback', onConcatFinishCallback);
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
			role: 'answering', cmd: 'changeRoomState',
			data: {
				action: 'open',
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
			role: 'answering', cmd: 'changeRoomState',
			data: {
				action: 'close',
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
		req.sanitize('roomId').escape().trim();
		req.checkBody('roomId', '').isObjectId();

		if (req.validationErrors()) {
			res.end(JSON.stringify(error.BadInput()));
			return;
		}

		if (!req.signedCookies || !req.signedCookies.username){
			res.end(JSON.stringify(error.NotLogin()));
			return
		}

		if (req.signedCookies.role == 'teacher' || req.signedCookies.role == 'student') {
			async.waterfall([
				function (next) {
					seneca.act({
						role: 'answering', cmd: 'changeRoomState',
						data: {
							action: 'enter',
							roomId: req.body.roomId,
							role: req.signedCookies.role,
							username: req.signedCookies.username
						}
					}, next);
				}
			], function (err, result) {
				if (err || _.isEmpty(result)) {
					res.end(JSON.stringify(error.PermissonDeny()));
				} else {
					seneca.act({
						role: 'answering', cmd: 'getRoom',
						data: { _id: req.body.roomId }
					}, function (err, room) {
						if (err || _.isEmpty(room)) {
							res.end(JSON.stringify(error.PermissonDeny()));
						} else {
							res.end(JSON.stringify({
								code: 200,
								data: {
									room: { roomId: room._id }
								}
							}));
						}
					})
				}
			})
		} else {
			res.end(JSON.stringify(error.PermissonDeny()));
		}
	}

	/**
	 * Description: 获取房间信息
	 *
	 * @param roomId: 房间编号
	 *
	**/
	function onGetRoom(req, res){
		req.body.roomId && req.sanitize('roomId').escape().trim();
		req.checkBody('roomId', '').isObjectId();

		if (!req.signedCookies) {
			res.end(JSON.stringify(error.NotLogin()));
			return;		
		}

		seneca.act({
			role: 'answering', cmd: 'getRoom',
			data: {
				roomId: req.body.roomId
			}
		}, function (err, result) {
			if (err)
				res.end(JSON.stringify(error.PermissonDeny()));
			else
				res.end(JSON.stringify({code: 200, data: {room: result}}));			
		})
	}

	function onleaveRoom(req, res) {
		req.sanitize('roomId').escape().trim();
		req.checkBody('roomId', '').isObjectId();

		if (!req.signedCookies) {
			res.end(JSON.stringify(error.NotLogin()));
			return;
		}

		seneca.act({
			role: 'answering', cmd: 'leaveRoom',
			data: {
				roomId: req.body.roomId,
				username: req.signedCookies.username,
				role: req.signedCookies.role
			}
		}, function (err, result){
			if (err)
				res.end(JSON.stringify(error.PermissonDeny()));
			else
				res.end(JSON.stringify({code: 200}));
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
				res.end(JSON.stringify(error.PermissonDeny));
				return;
			}

			seneca.act({
				role:'answering', cmd:'getAnswerings',
				data : queryData
			}, function (err, result){
				if(err){
					res.end(error.InternalError(err));
				} else {
					res.end(JSON.stringify({code: 200, data: result}));
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
			res.end(JSON.stringify(error.BadInput()));
			return;
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
		console.log(req.body.key);
		req.body.roomId && req.sanitize('roomId').escape().trim();
		req.checkBody('roomId', '').isObjectId();
		req.body.key && req.sanitize('key').escape().trim();
		req.checkBody('key', '').isTimeStamp();

		seneca.act({
			role: 'answering', cmd: 'addAudioSlice',
			data: {
				key: req.body.key,
				answeringId: req.body.answeringId
			}
		}, function (err, result) {
			if (err) {
				res.end(JSON.stringify(err));
			} else {
				res.end(JSON.stringify({ code: 200 }));
			}
		})
	}

	//拼接音频片段，拼接完成删除片段，更新答疑状态
	function onConcatAudioSlice (req, res) {
		//TODO 权限输入检查
		//TODO 拼接完成后删除片段
		
		var spaceName = 'sounds';
		var fops = 'avconcat/2/format/mp3';
		var prefix = 'http://7xkjiu.media1.z0.glb.clouddn.com/';

		seneca.act({
			role: 'answering', cmd: 'getAudioSlice',
			data: {
				answeringId: req.answeringId
			}
		}, function (err, slices) {
			if (err || !slices) {
				res.end(JSON.stringify());
			} else {
				qiniu.conf.ACCESS_KEY = 'zQKgGIPr-OBfpGn82vgqGF8iPeZO6qwO9LMtaJsk';
				qiniu.conf.SECRET_KEY = '5FFoL8KBg-9l1AMEoaXIuIjKbqYlgn0eJ_y7LNhn';

				for (var i; i < keys; i++) {
					fops = fops + '/' + qiniu.util.urlsafeBase64Encode(prefix + keys[i]);
				}

				var ops = { pipeline: 'soundsConcat' };

				qiniu.fop.pfop(spaceName, keys[0], fops, ops, function (err, result, response){
					res.end(result);
				})
			}
		})
	}

	function onConcatFinishCallback (req, res) {
		seneca.act({
			role: 'answering', cmd: 'updateAudioSlice',
			queryData: { answeringId: req.query.answeringId },
			updateData: { status: 'concated'}
		})
	}
}