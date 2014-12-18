'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var router = require('./router');

var config = require('./lib/config');

var app = express();

app.use(bodyParser.json());
app.use('/', router);

app.listen(config.port, function () {
    console.log('Slack Hooker listening on:', config.port);
});
