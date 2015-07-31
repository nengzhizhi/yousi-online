var assert = require('assert');
var request = require('supertest');
var qiniu = require

request = request('http://121.40.174.3');
describe('Room', function () {
	describe('#GetRoomByUsername', function(){
		it('Should return room info', function (done) {
			request
			.post('/api/answering/getRoomByUsername')
			.send({ username: 'nengzhizhi' })
			.end(function (err, res) {
				//console.log(res.body.data);
				assert.notEqual(null, res.body.data);
				assert.notEqual(null, res.body.data.room);
				done();
			})
		})
	})
})