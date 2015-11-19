'use strict';

import http from 'http';
import querystring from 'querystring';
import util from '../../util';
import config from '../../config';
import slackService from '../../slack-service';

const CONFIG_FILE = './lib/slash-commands/ci/config.json';

class CI {
    constructor() {
        return { runTask: this.runTask.bind(this) };
    }

    getConfig() {
        if (!this.CONFIG) {
            this.CONFIG = util.readJsonFromFileSync(CONFIG_FILE);
        }
        return this.CONFIG;
    }

    runTask(args, callback) {
        const validationError = this.parseArgs(args);
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
    }

    parseArgs(args) {
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
            let productName = args[1];
            let jobName = args[0];
            const product = this.getConfig().productsJobs[productName];
            if (!product) {
                return new Error(`Unknown product: \`${ productName }\``);
            }
            if (!product[jobName]) {
                return new Error(`Unknown job for \`${ productName }\`: \`${ jobName }\``);
            }
            this.productName = productName;
            this.jobName = jobName;
            this.channelName = product.SLACK_CHANNEL;
            this.version = args[2];
            this.jobUrl = product[jobName];
        }
        return undefined;
    }

    notifyChannel() {
        slackService.sendSimpleMessage(this.notifyMessage, this.channelName);
    }

    triggerCustomJob() {
        this.notifyMessage = `Triggering custom job: ${ this.customJobUrl }`;
        this.notifyChannel();
        http.get(this.customJobUrl);
    }

    triggerJob() {
        const param = querystring.stringify({
            RELEASE_VERSION: this.version,
            token: config.token
        });

        let url = this.jobUrl;
        if (!/\?/.test(url)) {
            url = this.jobUrl += '?';
        } else if (!/\&$/.test(url)) {
            url += '&';
        }

        url += param;
        http.get(url);
    }
}

const getUsageText = () => {
    return `Usage:
'\n\t \`/ci help\` or:
'\n\t \`/ci build app-name reference\` or:
'\n\t \`/ci release app-name 4.9.0\` or:
'\n\t \`/ci deploy app-name 4.9.0\` or:
'\n\t \`/ci http://custom-job-url\`.`;
};

export default new CI();
