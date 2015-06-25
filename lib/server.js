'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var router = require('./router');

var config = require('./config');

var app = express();

app.use(bodyParser.json());
app.use('/', router);

function start() {
    return app.listen(config.port, function () {
        console.log('Slack Hooker listening on:', config.port);
    });
}

exports.start = start;
exports.app = app;

