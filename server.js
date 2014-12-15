'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');

var config = require('./lib/config');
var slackService = require('./lib/slackService');
var bitbucketParser = require('./lib/bitbucketParser');
var extensionNumberCommand = require('./lib/slashCommands/ExtensionNumber');

var app = express();
app.use(logfmt.requestLogger());
app.use(bodyParser.json());

app.get('/', function (req, res) {
    console.log(req.query);
    var command = req.query && req.query.command || undefined;
    var text = req.query.text || undefined;

    if (command && command === '/ramal') {
        var func = text ?
            extensionNumberCommand.find.bind(extensionNumberCommand, text) :
            extensionNumberCommand.find.bind(extensionNumberCommand);

        func(function(out) {
            res.send(out);
        });
    } else {
        res.send('Set your hooks to point here.');
    }
});

app.post('*', function (req, res) {
    var channel = req.path.substring(1);
    var message = bitbucketParser.generateMessage(req.body);

    if (message !== undefined) {
        slackService.sendMessage(message, channel);
    }

    res.status(200).end();
});

app.listen(config.port, function () {
    console.log('Slack Hooker listening on:', config.port);
});
