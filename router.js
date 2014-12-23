'use strict';
var router = require('express').Router();

var slackService = require('./lib/slackService');
var bitbucketParser = require('./lib/incomingHooks/bitbucketParser');
var extensionNumberCommand = require('./lib/slashCommands/ExtensionNumber');
var config = require('./lib/config');

router.use(function(req, res, next) {
	// log each request to the console
	console.log('\n===>', req.method, req.path);
    if (process.env.NODE_ENV === 'DEBUG' || process.env.NODE_ENV === 'DEV') {
        console.log('PARAMS:\n', req.params);
        console.log('QUERY:\n', req.query);
        console.log('BODY:\n', req.body);
    }

	next();
});

/*
 * Routes:
 */
router.all('/', function (req, res) {
    res.send('Set your hooks to point here.');
});

router.get('/slashCommands/extensionNumber', function (req, res) {
    var command = req.query && req.query.command || undefined;
    var text = req.query.text || undefined;

    if (command && command === '/ramal') {
        var findExtension = text ?
            extensionNumberCommand.find.bind(extensionNumberCommand, text) :
            extensionNumberCommand.find.bind(extensionNumberCommand);

        findExtension(function(out) {
            res.send(out);
        });
    }
});

router.post('/incomingHooks/bitbucket/:channel?', function (req, res) {
    var channel = req.params.channel || config.channel.substring(1);
    var message = bitbucketParser.generateMessage(req.body);

    if (message !== undefined) {
        slackService.sendMessage(message, channel);
    }

    res.status(200).send({ message: message, channel: channel}).end();
});

module.exports = router;
