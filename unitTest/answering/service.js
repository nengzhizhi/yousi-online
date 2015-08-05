var assert = require('assert');
var seneca = require('seneca')({
	log: 'slient',
	debug: { undead: false }
});
var mongoose = require('mongoose');
mongoose.connect('mongodb://yousi:password@112.124.117.146:27017/yousi');

seneca.use('../../plugins/answering/service');

// describe('Answering Service', function(){
// 	describe('#GetRoom', function(){
// 		it("错误的输入导致获取房间失败！", function (done) {
// 			seneca.act({
// 				role: 'answering', cmd: 'getRoom', data: { _id: 'xxx-xxx'}
// 			}, function (err, data) {
// 				assert.equal('fail', data.result);
// 				done();
// 			})			
// 		});

// 		it("成功获取房间信息！", function (done) {
// 			seneca.act({
// 				role: 'answering', cmd: 'getRoom', data: { _id: '55b8c364d9d6eac7303adae9' }
// 			}, function (err, data) {
// 				assert.equal('success', data.result);
// 				done();
// 			})
// 		})
// 	})
// })

describe('Take Action', function(){
	describe('#enter', function(){
		// it("ok", function (done) {
		// 	seneca.act({
		// 		role: 'answering',
		// 		cmd: 'takeAction',
		// 		data: {
		// 			roomId: '55c16b9a9a1e2212455bc135',
		// 			action: 'enter',
		// 			role: 'teacher',
		// 			username: 'laoshi'
		// 		}
		// 	}, function (err, result) {
		// 		console.log(result);
		// 		done();
		// 	})
		// })

		// it("ok", function (done) {
		// 	seneca.act({
		// 		role: 'answering',
		// 		cmd: 'takeAction',
		// 		data: {
		// 			roomId: '55c16b9a9a1e2212455bc135',
		// 			action: 'enter',
		// 			role: 'student',
		// 			username: 'xuesheng'
		// 		}
		// 	}, function (err, result) {
		// 		console.log(result);
		// 		done();
		// 	})
		// })

		// it("ok", function (done) {
		// 	seneca.act({
		// 		role: 'answering',
		// 		cmd: 'takeAction',
		// 		data: {
		// 			roomId: '55c16b9a9a1e2212455bc135',
		// 			action: 'interrupt',
		// 			role: 'teacher',
		// 			username: 'laoshi'
		// 		}
		// 	}, function (err, result) {
		// 		console.log(result);
		// 		done();
		// 	})
		// })

		// it("ok", function (done) {
		// 	seneca.act({
		// 		role: 'answering',
		// 		cmd: 'takeAction',
		// 		data: {
		// 			roomId: '55c16b9a9a1e2212455bc135',
		// 			action: 'leave',
		// 			role: 'teacher',
		// 			username: 'laoshi'
		// 		}
		// 	}, function (err, result) {
		// 		console.log(result);
		// 		done();
		// 	})
		// })

		// it("ok", function (done) {
		// 	seneca.act({
		// 		role: 'answering',
		// 		cmd: 'takeAction',
		// 		data: {
		// 			roomId: '55c16b9a9a1e2212455bc135',
		// 			action: 'leave',
		// 			role: 'student',
		// 			username: 'student'
		// 		}
		// 	}, function (err, result) {
		// 		console.log(result);
		// 		done();
		// 	})
		// })		
	})

	describe('#interrupt', function(){

		// it("老师进入", function (done) {
		// 	seneca.act({
		// 		role: 'answering',
		// 		cmd: 'takeAction',
		// 		data: {
		// 			roomId: '55c16b9a9a1e2212455bc135',
		// 			action: 'enter',
		// 			role: 'teacher',
		// 			username: 'laoshi'
		// 		}
		// 	}, function (err, result) {
		// 		done();
		// 	})
		// })

		// it("学生进入", function (done) {
		// 	seneca.act({
		// 		role: 'answering',
		// 		cmd: 'takeAction',
		// 		data: {
		// 			roomId: '55c16b9a9a1e2212455bc135',
		// 			action: 'enter',
		// 			role: 'student',
		// 			username: 'xuesheng'
		// 		}
		// 	}, function (err, result) {
		// 		done();
		// 	})
		// })

		// it("老师中断", function (done) {
		// 	seneca.act({
		// 		role: 'answering',
		// 		cmd: 'takeAction',
		// 		data: {
		// 			roomId: '55c16b9a9a1e2212455bc135',
		// 			action: 'interrupt',
		// 			role: 'teacher',
		// 			username: 'laoshi'
		// 		}
		// 	}, function (err, result) {
		// 		done();
		// 	})
		// })		
	})

	describe('#leave', function(){
		it("老师离开", function (done) {
			seneca.act({
				role: 'answering',
				cmd: 'takeAction',
				data: {
					roomId: '55c16b9a9a1e2212455bc135',
					action: 'leave',
					role: 'teacher',
					username: 'laoshi'
				}
			}, function (err, result) {
				assert.equal('success', result.status);
				done();
			})
		})

		it("学生离开", function (done) {
			seneca.act({
				role: 'answering',
				cmd: 'takeAction',
				data: {
					roomId: '55c16b9a9a1e2212455bc135',
					action: 'leave',
					role: 'student',
					username: 'xuesheng'
				}
			}, function (err, result) {
				assert.equal('success', result.status);
				done();
			})
		})			
	})
})

