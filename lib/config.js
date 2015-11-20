'use strict';

import dotenv from 'dotenv';
dotenv.load();

export default {
    port: Number(process.env.PORT),
    token: process.env.SLACK_TOKEN, // Slack channel token
    hookUrl: process.env.SLACK_HOOKURL,
    channel: '#' + process.env.SLACK_CHANNEL, // Slack channel without # prefix
    username: process.env.SLACK_USERNAME,
    githubUser: process.env.GITHUB_USER,
    githubToken: process.env.GITHUB_ACCESS_TOKEN
};
