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

	seneca.add({role:'answering', cmd:'getRoom'}, cmd_getRoom);
	seneca.add({role:'answering', cmd:'getRooms'}, cmd_getRooms);
	seneca.add({role:'answering', cmd:'createRoom'}, cmd_createRoom);
	seneca.add({role:'answering', cmd:'updateRoom'}, cmd_updateRoom);
	seneca.add({role: 'answering', cmd: 'leaveRoom'}, cmd_leaveRoom);

	seneca.add({role: 'answering', cmd: 'changeRoomState'}, cmd_changeRoomState);


	seneca.add({role: 'answering', cmd: 'startAnswering'}, cmd_startAnswering);

	seneca.add({role:'answering', cmd:'createAnswering'}, cmd_createAnswering);
	seneca.add({role:'answering', cmd:'updateAnswering'}, cmd_updateAnswering);
	seneca.add({role:'answering', cmd:'getAnswerings'}, cmd_getAnswerings);
	seneca.add({role:'answering', cmd:'saveOperations'}, cmd_saveOperations);
	seneca.add({role:'answering', cmd:'getOperations'}, cmd_getOperations);

	seneca.add({role: 'answering', cmd: 'addAudioSlice'}, cmd_addAudioSlice);
	seneca.add({role: 'answering', cmd: 'getAudioSlice'}, cmd_getAudioSlice);
	seneca.add({role: 'answering', cmd: 'updateAudioSlice'}, cmd_updateAudioSlice);
	seneca.add({role: 'answering', cmd: 'concatAudioSlice'}, cmd_concatAudioSlice);

	function cmd_startAnswering (args, callback) {
		async.waterfall([
			function (next) {
				var answering = answeringModel();
				answering.student = args.data.student;
				answering.teacher = args.data.teacher;
				answering.created = Date.now();
				answering.audioFile = null;

				answering.save(function (err) {
					next(err, answering);
				});
			}
		], function (err, answering) {
			roomModel
			.where({ _id: args.data.roomId})
			.update({ answeringId: answering._id }, function (err, result) {
				callback(err, answering);
			})
		})
	}

	function cmd_changeRoomState(args, callback) {
		var action = args.data.action;
		var roomId = args.data.roomId;
		var role = args.data.role;
		var username = args.data.username;

		async.waterfall([
			function (next) {
				if (role == 'teacher') {
					queryData = { _id: roomId, teacher: username };
				} 
				else if(role == 'student') {
					queryData = { _id: roomId };
				}

				roomModel
				.findOne( queryData, function (err, room) {
					next(err, room);
				})	
			}, function (room, next) {
				console.log('room = ' + room);
				if (_.isEmpty(room)) {
					next(null, null);
					return;
				}

				var updateData = {};
				if (role == 'teacher') {
					if (action == 'enter') {
						if (room.status == 'empty') {
							updateData.status = 'waiting';
						} 
						else if (room.status == 'pending' && !_.isEmpty(room.student)) {
							updateData.status = 'answering';
						}
					} 
					else if (action == 'leave') {
						updateData.status = 'closed';
					} 
					else if (action == 'open') {
						if (room.status == 'closed') {
							updateData.status = 'empty';
						} 
					}
					else if (action == 'close') {
						updateData.status = 'closed';
					} 
					else if (action == 'interrupt') {
						console.log(room.status);
						if (room.status == 'answering') {
							updateData.status = 'pending';
						}
						else if (room.status == 'waiting' || room.status == 'pending') {
							updateData.status = 'empty';
							updateData.student = null;
							updateData.answeringId = null;
						}
					}
				}
				else if (role == 'student') {
					if (action == 'enter') {
						if (room.status == 'waiting') {
							updateData.status = 'answering';
							updateData.student = username;
						} 
						else if(room.status == 'pending' && room.student == username) {
							updateData.status = 'answering';
							updateData.student = username;
						}
					}
					else if (action == 'leave') {
						if (room.status == 'pending') {
							updateData.status = 'empty';
							updateData.student = null;
							updateData.answeringId = null;
						}
						else if (room.status == 'answering'){
							updateData.status = 'waiting';
							updateData.student = null;
							updateData.answeringId = null;
						}
					}
					else if (action == 'interrupt') {
						if (room.status == 'pending') {
							updateData.status = 'empty';
							updateData.student = null;
							updateData.answeringId = null;
						} 
						else if(room.status == 'answering') {
							updateData.status = 'pending';
						}
					}
				}
				next(null, updateData);		
			}, function (updateData, next) {
				
				_.isEmpty(updateData) && next(null, null);

				roomModel.where({ _id: roomId})
				.update(updateData, function (err, result){
					next(null, updateData);
				})
			}
		], function (err, result) {
			callback(err, result);
		})
	}

	function cmd_leaveRoom(args, callback) {
		async.waterfall([
			function (next) {
				if (args.data.role == 'teacher') {
					roomModel
					.where({
						_id: args.data.roomId,
						teacher: args.data.username
					})
					.update({
						teacher: null,
						status: 'closed'
					}, next)
				} else if(args.data.role == 'student') {
					roomModel
					.where({
						_id: args.data.roomId,
						student: args.data.username
					})
					.update({
						student: null,
						status: 'waiting'
					}, next)
				}
			}
		], function (err, result){
			callback(err, result);
		})
	}

	function cmd_getRoom(args, callback){
		roomModel
		.findOne(args.data, function (err, document){
			callback(err, document);
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
		//TODO check input
		var record = new roomModel();
		record.teacher = args.data.teacher;
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

	function cmd_createAnswering(args, callback){
		var record = new answeringModel();
		record.teacher = args.data.teacher;
		record.student = args.data.student;
		record.created = Date.now();

		record.save(function (error) {
			callback(error, record);
		});
	}

	function cmd_updateAnswering(args, callback){
		answeringModel
		.where({_id : args.data.answering})
		.update(args.data, callback);
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
		.find({
			answeringId: args.data.answeringId
		})
		.sort({ key: 1 })
		.exec(function (err, slices){
			callback(err, slices);
		})
	}

	function cmd_updateAudioSlice (args, callback) {
		audioSliceModel
		.where(args.data.queryData)
		.update(args.data.updateData, callback);
	}

	//结束答疑，发送concat指令
	function cmd_concatAudioSlice (args, callback) {
		var answeringId = args.data.answeringId;

		//TODO 在配置文件或者配置服务中读取
		var spacename = 'sounds';
		var prefix = 'http://7xkjiu.media1.z0.glb.clouddn.com/';
		var ACCESS_KEY = 'zQKgGIPr-OBfpGn82vgqGF8iPeZO6qwO9LMtaJsk';
		var SECRET_KEY = '5FFoL8KBg-9l1AMEoaXIuIjKbqYlgn0eJ_y7LNhn';
		var pipeline = 'soundsConcat';
		var notifyURL = 'http://121.40.174.3/api/answering/concatCallback';

		async.waterfall([
			function (next) {
				seneca.act({
					role: 'answering', cmd: 'getAudioSlice',
					data: { answeringId: answeringId }
				}, next)
			}, function (slices, next) {
				if (!_.isEmpty(slices)) {
					//更新答疑状态
					seneca.act({
						role: 'answering', cmd: 'updateAnswering',
						queryData: { _id: answeringId },
						updateData: { savingStatus: 'saving', audio: slices[0].key }
					})

					qiniu.conf.ACCESS_KEY = ACCESS_KEY;
					qiniu.conf.SECRET_KEY = SECRET_KEY;

					var concat_fops = 'avconcat/2/format/mp3';
					for (var i = 0; i < slices.length; i++) {
						concat_fops = concat_fops + '/' + qiniu.util.urlsafeBase64Encode(prefix + slices[i].key);
					}

					var ops = { 
						pipeline: pipeline,
						notifyURL: notifyURL + '?id=' + answeringId
					};

					qiniu.fop.pfop(
						spacename, 
						slices[0].key, 
						concat_fops, 
						ops, 
						function (err, result, response){
							if (_.isEmpty(err) && response.statusCode == 200) {
								next(null, { status: 'success' });
							} else {
								next(null, err);
							}
						}
					)
				}
			}
		], function (err, result) {
			callback(err, result);
		})
	}	
}