var assert = require('assert');
var request = require('supertest');

request = request('http://121.40.174.3');

describe('Answering Api', function () {
	describe('#getRoomByUsername', function(){
		it("获取房间成功", function (done) {
			request
			.post('/api/answering/getRoomByUsername')
			.send({ username: 'nengzhizhi'})
			.end(function (err, res) {
				assert(res.body.code == 200);
				done();
			})
		})
	})
})