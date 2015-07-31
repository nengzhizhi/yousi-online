var request = require('supertest');
var assert = require('assert');

request = request('http://121.40.174.3');
describe('Users', function(){
	describe('#Login', function(){
		it('should return {code: 200} after login success', function (done) {
			request
			.post('/api/users/login')
			.send({username: 'nengzhizhi', password: '123456'})
			.end(function(err, res){
				assert.equal(200, res.body.code);
				done();
			})
		})
	})
})