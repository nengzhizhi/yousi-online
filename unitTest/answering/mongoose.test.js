var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
mongoose.connect('mongodb://yousi:password@112.124.117.146:27017/yousi');

var testSchema = new Schema({
	status: String
});

testModel = mongoose.model('test', testSchema);


describe("Mongoose", function(){
	// describe("#save", function(){
	// 	it("ok", function (done) {
	// 		var record = new testModel();
	// 		record.status = 'test';

	// 		record.save(function (err) {
	// 			console.log(err);
	// 			done();
	// 		});
	// 	})
	// })

	describe("#Update Multi", function(){
		it("ok", function (done) {
			// testModel
			// .where({status: 'test'})
			// .update({status: '123'}, {multi: true}, function (err) {
			// 	console.log(err);
			// 	done();
			// })
		testModel.update(
			{status:'active', _id: '55c2d03daf756e8c1c4e6e87'}, {status: 'test'}, {multi: true}, function (err, num) {
				console.log(err);
				console.log(num);
				done()
			}
		)
		})
	})
})
