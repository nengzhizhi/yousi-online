var ejs = require('ejs');
var express = require('express');
var seneca = require('seneca')();
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

seneca.use('/plugins/common/api');

var api = require('express')();
api.use(bodyParser.urlencoded({ extended: false }))
.use(bodyParser.json())
.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Referer");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})
.use(expressValidator({
	customValidators : {
		isBucketname : function(value){
			return true;
		}
	}
}))
.use(seneca.export('web'))
.listen(2004);