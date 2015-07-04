var util = require('util');
var async = require('async');
var answeringModel = require('./model.js').answeringModel;
var roomModel = require('./model.js').roomModel;
var operationModel = require('./model.js').operationModel;

module.exports = function(options) {
	var seneca = this;

	seneca.options({strict:{result:false}})

	seneca.add({role:'answering', cmd:'getRoom'}, cmd_getRoom);
	seneca.add({role:'answering', cmd:'getRooms'}, cmd_getRooms);
	seneca.add({role:'answering', cmd:'createRoom'}, cmd_createRoom);
	seneca.add({role:'answering', cmd:'updateRoom'}, cmd_updateRoom);

	seneca.add({role:'answering', cmd:'createAnswering'}, cmd_createAnswering);
	seneca.add({role:'answering', cmd:'updateAnswering'}, cmd_updateAnswering);
	seneca.add({role:'answering', cmd:'addOperations'}, cmd_addOperations);
	seneca.add({role:'answering', cmd:'getOperations'}, cmd_getOperations);

	function cmd_getRoom(args, callback){
		roomModel
		.findOne(args.data, function (err, document){
			callback(err, document);
		});
	}

	function cmd_getRooms(args, callback){
		roomModel
		.find(args.data)
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
		record.status = args.data.status;

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

		record.save(function (error) {
			callback(error, record);
		});
	}

	function cmd_updateAnswering(args, callback){
		answeringModel
		.where({_id : args.data.answering})
		.update(args.data, callback);
	}

	function cmd_addOperations(args, callback){
		if (!util.isArray(args.data.records)) {
			throw new Error("Invalid input!");
		}

		var operation = new operationModel();
		operation.answering = args.data.answering;
		operation.records = args.data.records;
		operation.timestamp = args.data.timestamp;

		operation.save(function (error) {
			if (error) {
				throw new Error("answering addOperations save error!");
			}
		});

		callback(null, operation);
	}


	function cmd_getOperations(args, callback){
		if (!args.data.answering) {
			throw new Error('bad input');
		}

		operationModel
		.find(args.data)
		.sort({ timestamp : 1 })
		.exec(function (error, operations){
			callback(error, operations);
		});
	}
}