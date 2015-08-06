module.exports = function(options){
	var seneca = this;
	var router = seneca.export('web/httprouter');

	seneca.act('role:web', {use: router(function (app) {
		app.get('/api/room/couldEnter', onCouldEnter);
	})})

	function onCouldEnter(req, res){
		res.end(JSON.stringify{code: 200});
	}
}