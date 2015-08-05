var util = require('util');
var async = require('async');
var _ = require('lodash');
var qiniu = require('qiniu');
var answeringModel = require('./model.js').answeringModel;
var roomModel = require('./model.js').roomModel;
var operationModel = require('./model.js').operationModel;
var questionModel = require('./model.js').questionModel;
var audioSliceModel = require('./model.js').audioSliceModel;


module.exports = function(options) {
	var seneca = this;

	seneca.options({strict:{result:false}})

	seneca.add({role: 'answering', cmd:'getRoom'}, cmd_getRoom);
	seneca.add({role: 'answering', cmd:'getRooms'}, cmd_getRooms);
	seneca.add({role: 'answering', cmd:'openRoom'}, cmd_openRoom);
	seneca.add({role: 'answering', cmd:'closeRoom'}, cmd_closeRoom);
	seneca.add({role: 'answering', cmd:'createRoom'}, cmd_createRoom);
	seneca.add({role: 'answering', cmd:'updateRoom'}, cmd_updateRoom);

	seneca.add({role: 'answering', cmd: 'takeAction'}, cmd_takeAction);

	seneca.add({role: 'answering', cmd: 'startAnswering'}, cmd_startAnswering);
	seneca.add({role: 'answering', cmd: 'updateAnswering'}, cmd_updateAnswering);
	seneca.add({role: 'answering', cmd: 'getAnswering'}, cmd_getAnswering);
	seneca.add({role: 'answering', cmd: 'getAnswerings'}, cmd_getAnswerings);
	seneca.add({role: 'answering', cmd: 'saveOperations'}, cmd_saveOperations);
	seneca.add({role: 'answering', cmd: 'getOperations'}, cmd_getOperations);

	seneca.add({role: 'answering', cmd: 'addAudioSlice'}, cmd_addAudioSlice);
	seneca.add({role: 'answering', cmd: 'getAudioSlice'}, cmd_getAudioSlice);
	seneca.add({role: 'answering', cmd: 'updateAudioSlice'}, cmd_updateAudioSlice);
	seneca.add({role: 'answering', cmd: 'concatAudioSlice'}, cmd_concatAudioSlice);

	function cmd_startAnswering (args, callback) {
		async.waterfall([
			function (next) {
				roomModel
				.findOne({ _id: args.data.roomId }, function (err, room) {
					if (_.isEmpty(err) && !_.isEmpty(room)) {
						if (args.data.username == room.owner) {
							next(null, room)
						} else {
							next(null, null);
						}
					} else {
						next(null, null);
					}
				})
			}, function (room, next) {
				if (!_.isEmpty(room)) {
					var answering = answeringModel();
					answering.student = room.student;
					answering.teacher = room.teacher;
					answering.created = Date.now();
					answering.audio = null;

					answering.save(function (err) {
						next(err, answering);
					});					
				} else {
					next(null, null);
				}
			}, function (answering, next) {
				if (!_.isEmpty(answering)) {
					roomModel
					.where({ _id: args.data.roomId})
					.update({ answeringId: answering._id }, function (err, result) {
						next(err, result.ok > 0 ? answering : null);
					})					
				} else {
					next(null, null);
				}
			}
		], function (err, answering) {
			if (_.isEmpty(err) && !_.isEmpty(answering)) {
				callback(null, {status: 'success', data: answering});
			} else {
				callback(err, {status: 'fail'});
			}
		})
	}

	function cmd_openRoom(args, callback){
		var role = args.data.role;
		var roomId = args.data.roomId;
		var username = args.data.username;

		roomModel.where({ 
			_id: roomId,
			owner: username
		})
		.update({
			status: 'empty',
			teacher: null,
			student: null
		}, function (err, result) {
			if (_.isEmpty(err) && result.ok > 0) {
				callback(null, { status: 'success' });
			} else {
				callback(err, { status: 'fail' });
			}
		})		
	}

	function cmd_closeRoom(args, callback){
		var role = args.data.role;
		var roomId = args.data.roomId;
		var username = args.data.username;

		roomModel
		.where({ _id: roomId, owner: username })
		.update({
			status: 'closed'
		}, function (err, result) {
			if (_.isEmpty(err) && result.ok > 0) {
				callback(null, { status: 'success' });
			} else {
				callback(err, { status: 'fail' });
			}
		})
	}


	function cmd_takeAction (args, callback) {
		var action = args.data.action;
		var roomId = args.data.roomId;
		var role = args.data.role;
		var username = args.data.username;

		async.waterfall([
			function (next) {
				roomModel.findOne({ _id: roomId }, function (err, room) {
					next(err, room);
				})
			}, function (room, next) {
				if (!_.isEmpty(room)) {
					var updateData = canTakeAction(action, username, role, room);

					if (!_.isEmpty(updateData)) {
						if (room.answeringId && (action =='leave' || action =='interrupt')) {
							seneca.act({ role: 'answering', 
										 cmd:'concatAudioSlice',
										 data: { answeringId: room.answeringId } })							
						}

						roomModel
						.where({ _id: roomId })
						.update(updateData, function (err, result){
							//if (result.ok > 0)
							next(err, updateData);
						})
					} else {
						next(null, null);
					}
				} else {
					next(null, null);
				}
			}
		], function (err, result) {
			if (_.isEmpty(err) && !_.isEmpty(result)) {
				return callback(null, { status: 'success' });
			}
			return callback(err, {status: 'fail'});
		});
	}

	function canTakeAction (action, username, role, snap) {
		var updateData;
		//进入房间
		if (action == 'enter') {
			if (snap.owner == username && _.isEmpty(snap.teacher)) {
				updateData = {
					teacher: username,
					status: 'waiting'
				}
			} else if (role == 'student' && _.isEmpty(snap.student) && !_.isEmpty(snap.teacher)) {
				updateData = {
					student: username,
					status: 'answering'
				}
			}
			//判断游客进入的权限
		//中断	
		} else if (action == 'interrupt') {
			if (role == 'teacher' && snap.teacher == username) {				
				updateData = {
					student: null,
					teacher: null,
					status: 'closed'
				}			
			} else if (role == 'student' && snap.student == username) {
				if (snap.status == 'answering') {
					updateData = {
						student: null,
						status: 'waiting'
					}
				} else {
					updateData = { student: null }
				}
			}		
		//离开
		} else if (action == 'leave') {
			if (role == 'student' && snap.student == username) {
				if (snap.status == 'answering') {
					updateData = {
						student: null,
						status: 'waiting'
					}
				} else {
					updateData = {
						student: null
					}
				}
			} else if(role == 'teacher' && snap.teacher == username) {
				updateData = {
					student: null,
					teacher: null,
					status: 'closed'
				}
			}		
		}
		return updateData;
	}

	function cmd_getRoom(args, callback){
		roomModel
		.findOne(args.data, function (err, document){
			if (!_.isEmpty(err)) {
				callback(err, { status: 'fail', error: err });
			} else {
				callback(null, { status: 'success', data: document});
			}
		});
	}

	function cmd_getRooms(args, callback){
		roomModel
		.find({status: {$ne: 'closed'}})
		//.sort({ timestamp : 1 })
		.exec(function (error, rooms){
			callback(error, rooms);
		});
	}

	function cmd_createRoom(args, callback){
		var record = new roomModel();
		record.owner = args.data.owner;
		record.type = args.data.type;
		record.status = 'closed';

		record.save(function (error){
			callback(error, record);
		});
	}

	//FIXME
	function cmd_updateRoom(args, callback){
		roomModel
		.where(args.queryData)
		.update(args.updateData, callback);
	}

	function cmd_updateAnswering(args, callback){
		answeringModel
		.where(args.queryData)
		.update(args.updateData, callback);
	}

	function cmd_getAnswering(args, callback){
		answeringModel
		.findOne(args.data, function (err, answering) {
			callback(err, answering);
		})
	}

	function cmd_getAnswerings(args, callback){
		answeringModel
		.find(args.data)
		.sort({timestamp:1})
		.exec(function (err, answerings){
			callback(err, answerings);
		});
	}

	function cmd_saveOperations(args, callback){
		var operation = new operationModel();
		operation.aid = args.data.answeringId;
		operation.op = args.data.op;
		operation.t = args.data.t;

		operation.save(function (err) {
			callback(null, operation);
		});
	}


	function cmd_getOperations(args, callback){
		operationModel
		.find({
			aid : args.data.answeringId
		})
		.sort({ t : 1 })
		.skip(args.data.start)
		.limit(args.data.count)
		//.select('op', 't')
		.exec(function (err, operations){
			callback(err, operations);
		});
	}

	function cmd_addAudioSlice (args, callback) {
		var audioSlice = new audioSliceModel();

		audioSlice.answeringId = args.data.answeringId;
		audioSlice.key = args.data.key;

		audioSlice.save(function (err) {
			callback(err, audioSlice);
		})
	}

	function cmd_getAudioSlice (args, callback) {
		audioSliceModel
		.find(args.data)
		.sort({ key: 1 })
		.exec(function (err, slices){
			callback(err, slices);
		})
	}

	function cmd_updateAudioSlice (args, callback) {
		audioSliceModel
		.where(args.queryData)
		.update(args.updateData, callback);
	}

	function qiniuConcat(slices, notifyURL, callback){
		//TODO 在配置文件或者配置服务中读取
		var spacename = 'sounds';
		var prefix = 'http://7xkjiu.media1.z0.glb.clouddn.com/';
		var ACCESS_KEY = 'zQKgGIPr-OBfpGn82vgqGF8iPeZO6qwO9LMtaJsk';
		var SECRET_KEY = '5FFoL8KBg-9l1AMEoaXIuIjKbqYlgn0eJ_y7LNhn';
		var pipeline = 'soundsConcat';

		qiniu.conf.ACCESS_KEY = ACCESS_KEY;
		qiniu.conf.SECRET_KEY = SECRET_KEY;

		var concat_fops = 'avconcat/2/format/mp3';
		for (var i = 1; i < slices.length; i++) {
			concat_fops = concat_fops + '/' + qiniu.util.urlsafeBase64Encode(prefix + slices[i].key);
		}

		var ops = { 
			pipeline: pipeline,
			notifyURL: notifyURL
		};

		qiniu.fop.pfop(
			spacename, 
			slices[0].key, 
			concat_fops, 
			ops, 
			function (err, result, response){
				if (_.isEmpty(err) && response.statusCode == 200) {
					callback(null, { status: 'success' });
				} else {
					callback(null, err);
				}
			}
		)		
	}


	//结束答疑，发送concat指令
	function cmd_concatAudioSlice (args, callback) {
		console.log(_.isEmpty(args.data.answeringId));
		if (_.isEmpty(args.data) || _.isEmpty(args.data.answeringId)) {
			callback(null, null);
			return;
		} else {
			var answeringId = args.data.answeringId;
		}
		console.log('start concat audio slice' + answeringId);		

		async.waterfall([
			function (next) {
				answeringModel.findOne({
					_id: answeringId, savingStatus: 'waiting'
				}, function (err, answering) {
					if (_.isEmpty(answering) || err) {
						callback(err, null);
					} else {
						next(err, answering);
					}
				})
			},
			function (result, next) {
				seneca.act({
					role: 'answering', cmd: 'getAudioSlice',
					data: { answeringId: answeringId, status: 'alone' }
				}, next)
			}, function (slices, next) {
				//更新答疑状态
				seneca.act({
					role: 'answering', cmd: 'updateAnswering',
					queryData: { _id: answeringId },
					updateData: { savingStatus: 'saving' }
				})

				if (!_.isEmpty(slices)) {
					var notifyURL = 'http://121.40.174.3/api/answering/concatCallback' + '?id=' + answeringId;
					qiniuConcat(slices, notifyURL, next);
				} else {
					callback(null, { status: 'success' });
				}
			}
		], function (err, result) {
			callback(err, result);
		})
	}
}