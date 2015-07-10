import express from 'express';
const router = new express.Router();
import slackService from './slackService';
import extCommand from './slashCommands/ext/Ext';
import ciCommand from './slashCommands/ci/CI';

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
                res.status(400).send(err.message);
            } else {
                res.status(200).send(out);
            }
        });
    }
});

router.get('/slashCommands/ext', (req, res) => {
    const command = req.query && req.query.command;
    const text = req.query.text;

    if (command && command === '/ramal') {
        const findExtension = text ?
            extCommand.find.bind(extCommand, text) :
            extCommand.find.bind(extCommand);

        findExtension(out => {
            res.send(out);
        });
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

        const prsCommand = require('./slashCommands/prs/Prs')(res);

        prsCommand.listPrs(repo, (err, out, channel) => {
            if (err) { res.status(400).send(err); }

            slackService.sendSimpleMessage(out, channel);
        });
    }
});

export default router;
