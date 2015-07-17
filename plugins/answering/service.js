var util = require('util');
var async = require('async');
var answeringModel = require('./model.js').answeringModel;
var roomModel = require('./model.js').roomModel;
var operationModel = require('./model.js').operationModel;
var questionModel = require('./model.js').questionModel;

module.exports = function(options) {
	var seneca = this;

	seneca.options({strict:{result:false}})

	seneca.add({role:'answering', cmd:'getRoom'}, cmd_getRoom);
	seneca.add({role:'answering', cmd:'getRooms'}, cmd_getRooms);
	seneca.add({role:'answering', cmd:'createRoom'}, cmd_createRoom);
	seneca.add({role:'answering', cmd:'updateRoom'}, cmd_updateRoom);

	seneca.add({role:'answering', cmd:'createAnswering'}, cmd_createAnswering);
	seneca.add({role:'answering', cmd:'updateAnswering'}, cmd_updateAnswering);
	seneca.add({role:'answering', cmd:'getAnswerings'}, cmd_getAnswerings);
	seneca.add({role:'answering', cmd:'saveOperations'}, cmd_saveOperations);
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

	// function cmd_addQuestions(args, callback){
	// 	var question = new questionModel();

	// 	question.answeringId = args.data.answeringId;
	// 	question.teacher = args.data.teacher;
	// 	question.student = args.data.student;
	// 	question.created = Date.now();
	// 	question.key = args.data.key;
	// 	question.meta = args.data.meta;

	// 	question.save(function (err){
	// 		callback(null, question);
	// 	})
	// }

	// function operationEncode(operation){
	// 	var code = [];

	// 	var template = {
	// 		op : { mouseDown:1, mouseUp:2, mouseMove:3, drawText:4, drawImage:5, modifyObject:6, createLayer:7, switchLayer:8},
	// 		color : {'rgba(255, 0, 0, 1)':1, 'rgba(0, 0, 0, 1)':2, 'rgba(0, 255, 0, 1)':3, 'rgba(0, 0, 255, 1)':4, 'rgba(255, 255, 255, 0)':5},
	// 		type : {line:1, retangle:2, triangle:3, circle:4, baseline:5, erase:6, font:7, attach:8, move:9}
	// 	}

	// 	code.push(template.op[operation.op]);
	// 	code.push(operation.x);
	// 	code.push(operation.y);
	// 	code.push(template.color[operation.fillColor]);
	// 	code.push(template.color[operation.strokeColor]);
	// 	code.push(operation.timestamp)


	// 	return code;
	// }

}