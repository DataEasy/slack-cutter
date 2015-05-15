'use strict';

var http = require('http');
var querystring = require('querystring');
var util = require('../../util');
var config = require('../../config');
var slackService = require('../../slackService');

var CONFIG_FILE = './lib/slashCommands/ci/ci.json';

function CI() {
    return {
        runTask: this.runTask.bind(this)
    };
}

var getUsageText = function () {
    return 'Usage:' +
        '\n\t `/ci help` or:' +
        '\n\t `/ci build app-name reference` or:' +
        '\n\t `/ci release app-name 4.9.0` or:' +
        '\n\t `/ci deploy app-name 4.9.0` or:' +
        '\n\t `/ci http://custom-job-url`.';
};

CI.prototype.getConfig = function () {
    if (!this.CONFIG) {
        this.CONFIG = util.readJsonFromFileSync(CONFIG_FILE);
    }
    return this.CONFIG;
};

CI.prototype.runTask = function (args, callback) {
    var validationError = this.parseArgs(args);

    if (validationError) {
        callback(validationError);
        return;
    }

    if (args.length === 1) {
        if (this.isHelp) {
            callback(null, getUsageText());
            return;
        } else {
            this.triggerCustomJob();
        }
    } else {
        this.triggerJob();
    }

    callback(null);
};

CI.prototype.parseArgs = function (args) {
    if (!args || !args.length || args.length === 0) {
        return new Error('At least one argument is necessary');
    }

    if (args.length > 3 || args.length === 2) {
        return new Error('Only 1 or 3 arguments are accepted');
    }

    if (args.length === 1) {
        this.isHelp = false;
        if (args[0] === 'help') {
            this.isHelp = true;
        } else if (args[0].indexOf(this.getConfig().CI_DOMAIN) === -1) {
            return new Error('That does not appear do be a valid CI URL');
        } else {
            this.customJobUrl = args[0];
        }
    }

    if (args.length === 3) {
        var productName = args[1];
        var jobName = args[0];

        var product = this.getConfig().productsJobs[productName];

        if (!product) {
            return new Error('Unknown product: `' + productName + '`');
        }

        if (!product[jobName]) {
            return new Error('Unknown job for `' + productName + '`: `' + jobName + '`');
        }

        this.productName = productName;
        this.jobName = jobName;
        this.channelName = product.SLACK_CHANNEL;
        this.version = args[2];
        this.jobUrl = product[jobName];
    }

    return undefined;
};

CI.prototype.notifyChannel = function () {
    slackService.sendSimpleMessage(this.notifyMessage, this.channelName);
};

CI.prototype.triggerCustomJob = function () {
    this.notifyMessage = 'Triggering custom job: ' + this.customJobUrl;
    this.notifyChannel();
    http.get(this.customJobUrl);
};

CI.prototype.triggerJob = function() {
    var param = querystring.stringify({
        RELEASE_VERSION: this.version,
        token: config.token
    });
    var url = this.jobUrl;

    if (!/\?/.test(url)) {
        url = this.jobUrl += '?';
    } else if (!/\&$/.test(url)) {
        url += '&';
    }

    url += param;

    this.notifyMessage = 'Triggering *' + this.productName + ' ' + this.jobName + '* for `' + this.version + '`';
    this.notifyChannel();
    http.get(url);
};

module.exports = new CI();
