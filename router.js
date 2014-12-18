'use strict';
var router = require('express').Router();

var slackService = require('./lib/slackService');
var bitbucketParser = require('./lib/incomingHooks/bitbucketParser');
var extensionNumberCommand = require('./lib/slashCommands/ExtensionNumber');

router.get('/slashCommands/ramal', function (req, res) {
    console.log(req.query);
    var command = req.query && req.query.command || undefined;
    var text = req.query.text || undefined;

    if (command && command === '/ramal') {
        var findExtension = text ?
            extensionNumberCommand.find.bind(extensionNumberCommand, text) :
            extensionNumberCommand.find.bind(extensionNumberCommand);

        findExtension(function(out) {
            res.send(out);
        });
    } else {
        res.send('Set your hooks to point here.');
    }
});

router.post('*', function (req, res) {
    var channel = req.path.substring(1);
    var message = bitbucketParser.generateMessage(req.body);

    if (message !== undefined) {
        slackService.sendMessage(message, channel);
    }

    res.status(200).end();
});

module.exports = router;
