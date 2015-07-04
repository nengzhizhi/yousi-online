var http = require('http');

var params = JSON.stringify({

});

var options = {
	host : '127.0.0.1',
	port : 2002,
	path : '/api/answering/createRoom',
	method : 'post',
	headers : {
		'Content-Type':'application/x-www-form-urlencoded',
		'Content-Length':params.length		
	}
}

var req = http.request(options, function (res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
	console.log('BODY: ' + chunk);
	});
});

req.write(params);
req.end();