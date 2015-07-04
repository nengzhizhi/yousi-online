var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var operationSchema = new Schema({
	answeringId : ObjectId,
	records : Array,
	timestamp : Number
});

var answeringSchema = new Schema({
	created : { type: Date, default: Date.now },
	teacher : String,
	student : String,
	duration : Number
});

var roomSchema = new Schema({
	created : { type: Date, default: Date.now },
	type : { type:String, required: false, default: 'answering'},
	status : { type:String,  required: false, default: 'waiting'},
	teacher : String,
	student : String,
	answeringId : ObjectId
});

exports.roomModel = mongoose.model('room', roomSchema);
exports.answeringModel = mongoose.model('answering', answeringSchema);
exports.operationModel = mongoose.model('operation', operationSchema);