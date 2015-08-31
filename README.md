[![Build Status](https://travis-ci.org/DataEasy/slack-hooker.svg)](https://travis-ci.org/DataEasy/slack-hooker)
[![Test Coverage](https://codeclimate.com/github/DataEasy/slack-hooker/badges/coverage.svg)](https://codeclimate.com/github/DataEasy/slack-hooker/coverage)
[![Code Climate](https://codeclimate.com/github/DataEasy/slack-hooker/badges/gpa.svg)](https://codeclimate.com/github/DataEasy/slack-hooker)
[![Dependency Status](https://david-dm.org/DataEasy/slack-hooker.svg)](https://david-dm.org/DataEasy/slack-hooker)

Slack Hooker
============

We'll hook you up with Slack :)

Slack Hooker is an intermediary API to communicate with Slack. You can create custom Slack slash commands, incoming hooks, bots, cron jobs (soon)...

Written in ES6/2015 with transpiling to ES5 via [Babel](http://babeljs.io)

## Features

Right now we have the following slash commands:

* [Extension Number](./lib/slash-commands/ext/): Lookup your colleague's extension number. Eg:
  * `/ext John`: searches for John's extension number
  * `/ext`: List all available extension numbers
* [Continuous Integration server](./lib/slash-commands/ci/): Trigger builds in your CI server. Eg:
  * `/ci build my-product`
  * `/ci release my-product 1.2.3-alpha`
  * `/ci deploy my-product 1.2.3-alpha`
* [Pull Requests](./lib/slash-commands/prs/): List a project Pull Requests from GitHub in a particular channel to facilitate code review and prioritization. Eg:
  * `/prs my-product`
* Any new API should be fairly easy to add. Just create a new route.

## Requirements

  * [Slack](https://slack.com/) token and hook url: Get them from your "integrations" page
  * [Node.js](http://nodejs.org/) **or** [Docker](https://www.docker.com/)

## Configuration

### General Configuration

#### .env file

The configuration variables are set via environment variables and/or using the `.env` file (environment variable has precedence over `.env` file).

Just copy the [`example.env`](./example.env) as `.env` and modify it as needed.

The GitHub credentials are only needed if you're planning to use the [`/prs`](./lib/slash-commands/prs/) commands.

**Important**: if you're going to use a `.env` file AND are using Docker, edit it before you build the Dockerfile.

#### Slash Commands

Every slash commands takes a `.json` with private data. See the README in each command's directory to learn how to configure  and use them. Basically, you'll have to copy the `config.example.json` to `config.json` and edit them to your needs `;-)`.

## Installation

You can install it in your own local infrastructure or in a cloud service like heroku.
Alternatively, you can build a Docker image and [deploy as container](#installation-using-docker)

  1. Set up a server address in your local infrastructure that will serve this application (eg: `slackapi.mycompany.com` or `slackapi.heroku.com`)
  2. Clone/download this repo to your chosen server
  3. Configure your application according to the "Configuration" section above

### Via pure NodeJS + npm

  4. Install NodeJS if you don't have it already
  5. Run `npm install` in the app's root folder

  **Important note**: make sure you don't have any firewall blocking the incoming TCP port (default is PORT 5000 as defined in the "Configuration" section above)

## Via Docker

  4. Build the Docker image: `npm run container:build`

**Note:** In Linux the `<dockerhost>` is `localhost`, within OSX's Boot2docker, use the IP reported by the command: `boot2docker ip`

## Usage

### Via pure node or npm

  1. Run `npm start` to fire up the application

### Via Docker

  1. Run the container:
    1. If you used the `.env` file: `npm run container:run`
    2. Without `.env` file:

     ```sh
     docker run -e PORT=5000 -e SLACK_TOKEN=123123 -e SLACK_DOMAIN=company -e SLACK_CHANNEL=channel -p 5000:5000 -d slack-hooker
     ```

  2. Ensure the container is running (you should also be able to access the service using web browser: `http://<dockerhost>:5000/`).

You can run `npm run | grep container:` to see other available container actions.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
