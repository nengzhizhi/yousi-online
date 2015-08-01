var assert = require('assert');
var request = require('supertest');
var qiniu = require

request = request('http://121.40.174.3');
describe('AudioSlice', function () {
	// describe('#Upload file to Qiniu', function(){
	// })


	// describe('#Add Audio Slice', function(){
	// 	it('Should return {code: 200} after add', function (done) {
	// 		request
	// 		.post('/api/answering/addAudioSlice')
	// 		.send({
	// 			answeringId: '55b89ac04e022b5031f07568', 
	// 			key: '1438308799'
	// 		})
	// 		.end(function (err, res){
	// 			assert.equal(200, res.body.code);
	// 			done();
	// 		})
	// 	})
	// })

	describe('#Concat audio slice', function(){
		it('Should echo ConcatAudioSliceFail{code: 100009} on empty slice!', function (done) {
			request
			.post('/api/answering/concatAudioSlice')
			.send({ answeringId: '55b89ac04e022b5031f07568' })
			.end(function (err, res) {
				assert.equal(100009, res.body.code);
				done();
			})
		})

		it('Should echo {code: 200} after request!', function (done) {
			request
			.post('/api/answering/concatAudioSlice')
			.send({ answeringId: '55b89ac04e022b5031f07568' })
			.end( function (err, res) {
				assert.equal(200, res.body.code);
				done();
			})
		})
	})


	// describe('#Concat callback', function(){
	// 	it('Shuld return {code: 200} after concat', function (done) {
	// 		request
	// 		.get('/api/answering/concatCallback')
	// 	})
	// })
})