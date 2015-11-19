'use strict';

import Slack from 'node-slack';
import config from './config';

const slack = new Slack(config.hookUrl, config.token);
const params = {
    channel: config.channel,
    username: config.username,
    attachments: []
};

function noop() {}

function SlackService() {}

SlackService.prototype = {
    sendMessage(message, channel, callback = noop) {
        // `text` is mandatory:
        params.text = message.fallback;
        params.attachments[0] = message;

        if (channel !== '') {
            params.channel = '#' + channel;
        }

        console.log('Sending message to Slack...', params);
        slack.send(params, noop);
    },

    sendSimpleMessage(rawMsg, channel) {
        const message = { fallback: rawMsg };

        this.sendMessage(message, channel);
    }
};

export default new SlackService();
