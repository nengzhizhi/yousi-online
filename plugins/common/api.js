var qiniu = require('qiniu');

module.exports = function (options) {
	var seneca = this;
	var router = seneca.export('web/httprouter');

	qiniu.conf.ACCESS_KEY = 'edXr9sq-i4ZfzIQfM3SywzgjaCS985pB7ICOe3n_';
	qiniu.conf.SECRET_KEY = 'zj2VJmkG3CWTQW7Tl2wMsq7b9WNiUzUiRfjxZb3s';

	seneca.act('role:web', {use:router(function (app) {
		app.get('/api/common/upload/token', onUploadToken);
	})});

	//TODO 上传时检查权限
	function onUploadToken(req, res){
		var putPolicy = new qiniu.rs.PutPolicy('test');
		//putPolicy.expires = 60;

		res.end(JSON.stringify({'uptoken':putPolicy.token()}));
	}
}