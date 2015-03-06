'use strict';

var Slack = require('node-slack');
var config = require('./config');
var util = require('./util');

var slack = new Slack(config.domain, config.token);
var params = {
    channel: config.channel,
    username: config.username,
    attachments: []
};

function noop() {}

function SlackService() {}

SlackService.prototype = {
    sendMessage: function (message, channel, callback) {
        callback = callback || noop;

        // `text` is mandatory:
        params.text = message.fallback;
        params.attachments[0] = message;

        if (channel !== '') {
            params.channel = '#' + channel;
        }

        slack.send(params, noop);
    },

    sendSimpleMessage: function(channel, msgTitle, msgBody, msgColor) {
        var message = {
            fallback: msgTitle,
            color: msgColor || util.COLORS.blue,
            fields: [{
                title: msgTitle,
                value: msgBody
            }]
        };

        this.sendMessage(message, channel);
    }
};

module.exports = new SlackService();
