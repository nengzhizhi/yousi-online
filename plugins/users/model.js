var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var userSchema = new Schema({
	created : { type:Date, default:Date.now },
	username : String,
	password : String,
	role : {type:String, default:'student'}
});

exports.usersModel = mongoose.model('users', userSchema);