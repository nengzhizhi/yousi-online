var assert = require('assert');
var request = require('supertest');
var qiniu = require('qiniu');

request = request('http://121.40.174.3');

function uploadFile(bucketName, key, localFile, callback){
	qiniu.conf.ACCESS_KEY = 'zQKgGIPr-OBfpGn82vgqGF8iPeZO6qwO9LMtaJsk';
	qiniu.conf.SECRET_KEY = '5FFoL8KBg-9l1AMEoaXIuIjKbqYlgn0eJ_y7LNhn';
	
	var putPolicy = new qiniu.rs.PutPolicy(bucketName);
	var token = putPolicy.token();

	var extra = new qiniu.io.PutExtra();
	qiniu.io.putFile(token, key, localFile, extra, callback);	 
}

// describe('Qiniu', function(){
// 	describe('#Upload file', function(){
// 		it('Should return true', function (done) {
// 			uploadFile('sounds', 'hello.mp3', '1.ogg', function(err, ret) {
// 				if (!err) {}
// 				else {}
// 				done();
// 			})
// 		})
// 	})
// })


describe('AudioSlice', function () {
	describe('#Add Audio Slice', function(){
		it('Should return {code: 200} after add', function (done) {

			var key = Date.now();
			uploadFile('sounds', key.toString(), '1.ogg', function (err, ret){
				console.log(err)
				assert.equal(null, err);
				request
				.post('/api/answering/addAudioSlice')
				.send({
					answeringId: '55b89ac04e022b5031f07568', 
					key: key
				})
				.end(function (err, res){
					assert.equal(200, res.body.code);
					done();
				})
			})
		})
	})
})
// 	describe('#Concat audio slice', function(){
// 		it('Should echo ConcatAudioSliceFail{code: 100009} on empty slice!', function (done) {
// 			request
// 			.post('/api/answering/concatAudioSlice')
// 			.send({ answeringId: '55b89ac04e022b5031f07568' })
// 			.end(function (err, res) {
// 				assert.equal(100009, res.body.code);
// 				done();
// 			})
// 		})

// 		it('Should echo {code: 200} after request!', function (done) {
// 			request
// 			.post('/api/answering/concatAudioSlice')
// 			.send({ answeringId: '55b89ac04e022b5031f07568' })
// 			.end( function (err, res) {
// 				assert.equal(200, res.body.code);
// 				done();
// 			})
// 		})
// 	})
// })