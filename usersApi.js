var ejs = require('ejs');
var express = require('express');
var seneca = require('seneca')();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://yousi:password@112.124.117.146:27017/yousi');

seneca.use('/plugins/users/api');

var api = require('express')();

api.engine('.html', ejs.__express) // for app
api.set('view engine', 'html') //for app
api
.use(express.static(__dirname + '/public'))
.use(bodyParser.urlencoded({ extended: false }))
.use(bodyParser.json())
.use(cookieParser('key'))
.use(seneca.export('web'))
.listen(2003);