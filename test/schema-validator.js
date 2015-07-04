var http = require('http');
var Validator = require('schema-validator');

var schema = {
	objectId : {
		//type : String,
		//required : true
		length : {min:2, max:30},
		test : /^[a-z0-9]+$/g
	}
}

var server = http.createServer(function (req, res){
	var validator = new Validator(schema);
	console.log(validator.check({objectId:'123aa'}));
	res.end();
});

server.listen(1001);