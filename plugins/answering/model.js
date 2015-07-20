var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var operationSchema = new Schema({
	aid : ObjectId,
	op : Array,
	t : Number
});

var answeringSchema = new Schema({
	created : Number,
	closed : Number,
	teacher : String,
	student : String
});

var roomSchema = new Schema({
	created : { type: Date, default: Date.now },
	type : { type:String, required: false, default: 'answering'},
	status : { type:String,  required: false, default: 'waiting'},
	teacher : String,
	student : String,
	answeringId : ObjectId
});

var questionSchema = new Schema({
	created : Number,
	teacher : String,
	student : String,
	answeringId : ObjectId,
	key : String,
	meta : String
});

exports.roomModel = mongoose.model('room', roomSchema);
exports.answeringModel = mongoose.model('answering', answeringSchema);
exports.operationModel = mongoose.model('operation', operationSchema);
exports.questionModel = mongoose.model('question', questionSchema);