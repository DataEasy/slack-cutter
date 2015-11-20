'use strict';

import Slack from 'node-slack';
import config from './config';

const slack = new Slack(config.hookUrl, config.token);
const params = {
    channel: config.channel,
    username: config.username,
    attachments: []
};

class SlackService {
    sendMessage(message, channel, callback) {
        // `text` is mandatory:
        params.text = message.fallback;
        params.attachments[0] = message;

        params.channel = '#' + channel;

        slack.send(params, callback);
    }

    sendSimpleMessage(rawMsg, channel) {
        const message = { fallback: rawMsg };

        this.sendMessage(message, channel);
    }
}

export default new SlackService();
