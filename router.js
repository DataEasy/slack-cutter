'use strict';
var router = require('express').Router();

var slackService = require('./lib/slackService');
var bitbucketParser = require('./lib/incomingHooks/bitbucketParser');
var extensionNumberCommand = require('./lib/slashCommands/ExtensionNumber');


router.use(function(req, res, next) {
	// log each request to the console
	console.log('\n===>', req.method, req.url);
    if (process.env.NODE_ENV === 'DEBUG' || process.env.NODE_ENV === 'DEV') {
        console.log(req.body);
    }

	next();
});

/*
 * Routes:
 */
router.all('/', function (req, res) {
    res.send('Set your hooks to point here.');
});

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
    }
});

router.post('incomingHooks/bitbucket', function (req, res) {
    var channel = req.path.substring(1);
    var message = bitbucketParser.generateMessage(req.body);

    if (message !== undefined) {
        slackService.sendMessage(message, channel);
    }

    res.status(200).end();
});

module.exports = router;
