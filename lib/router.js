'use strict';

import express from 'express';
const router = new express.Router();
import slackService from './slack-service';
import extCommand from './slash-commands/ext/ext';
import ciCommand from './slash-commands/ci/ci';
import PrsCommand from './slash-commands/prs/prs';
import config from './config';

/*
 * Routes:
 */
router.all('/', (req, res) => {
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
 *  const command = req.query && req.query.command;
 *  const text = req.query.text || undefined;
 *  to an express middleware for the /slashCommands/ endpoint
 */
router.get('/slashCommands/ci', (req, res) => {
    const command = req.query && req.query.command;
    const text = req.query.text;

    if (command && command === '/ci') {
        const args = text && text.split && text.split(' ') || [];

        ciCommand.runTask.call(ciCommand, args, (err, out) => {
            if (err) {
                return res.status(400).send(err.message);
            }
            res.status(200).send(out);
        });
    }
});

router.get('/slashCommands/ext', (req, res) => {
    const command = req.query && req.query.command;
    const text = req.query.text;

    if (command && command === '/ramal') {
        const getExtension = text ?
            extCommand.getExtension.bind(extCommand, text) :
            extCommand.getExtension.bind(extCommand);

        getExtension(out => res.send(out));
    }
});

router.get('/slashCommands/prs', (req, res) => {
    const command = req.query && req.query.command;
    const text = req.query.text;

    if (!text) {
        res.status(400).send('At least one argument is necessary');
        return;
    }

    if (command && command === '/prs') {
        const repo = text.trim();

        const prsCommand = new PrsCommand(res);

        prsCommand.listPrs(repo, (err, out, channel) => {
            if (err) { res.status(400).send(err); }

            slackService.sendSimpleMessage(out, channel);
        });
    }
});

export default router;
