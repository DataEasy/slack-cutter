'use strict';

var Slack = require('node-slack');
var config = require('./config');
var slack = new Slack(config.domain, config.token);
var params = {
    channel: config.channel,
    username: config.username,
    attachments: []
};

function noop() {}

module.exports = {
    sendMessage: function (message, channel) {
        // `text` is mandatory:
        params.text = message.fallback;
        params.attachments[0] = message;

        if (channel !== '') {
            params.channel = '#' + channel;
        }

        slack.send(params, noop);
    }
};

