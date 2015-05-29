'use strict';
var express = require('express');
var router = new express.Router();

var extensionNumberCommand = require('./lib/slashCommands/extensionNumber/ExtensionNumber');
var prsCommand = require('./lib/slashCommands/prs/Prs');

var ciCommand = require('./lib/slashCommands/ci/CI');

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

/* TODO: Use middleware to check for slack token's existance (avoid
 * URL triggering from 3rd parties...
 */

/* TODO: Refactor to all slash commands URLs point to the same URL
 *  Ex.: `/slashCommands` instead of `slashCommands/commandName`
 *  and then infer with router to follow based on `req.query.command`
 */

/* TODO: Extract the following kind of treatment:
 *  var command = req.query && req.query.command || undefined;
 *  var text = req.query.text || undefined;
 *  to an express middleware for the /slashCommands/ endpoint
 */
router.get('/slashCommands/ci', function (req, res) {
    var command = req.query && req.query.command || undefined;
    var text = req.query.text || undefined;

    if (command && command === '/ci') {
        var args = text && text.split && text.split(' ') || [];

        ciCommand.runTask.call(ciCommand, args, function(err, out) {
            if (err) {
                res.status(400).send(err.message);
            } else {
                res.status(200).send(out);
            }
        });
    }
});

router.get('/slashCommands/ext', function (req, res) {
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

router.get('/slashCommands/prs', function (req, res) {
    var command = req.query && req.query.command || undefined;
    var text = req.query.text || undefined;

    if (command && command === '/prs') {
        var searchPrs = text ?
            prsCommand.search.bind(prsCommand, text) :
            prsCommand.search.bind(prsCommand);

        searchPrs(function (out) {
            res.send(out);
        });
    }
});

module.exports = router;
