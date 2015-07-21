[![Build Status](http://ci.dataeasy.com.br/buildStatus/icon?job=(SlackHooker) Master Builder)](http://ci.dataeasy.com.br/job/(SlackHooker) Master Builder)
[![Coverage Status](https://coveralls.io/repos/DataEasy/slack-hooker/badge.svg?branch=master&service=github)](https://coveralls.io/github/DataEasy/slack-hooker?branch=master)

Slack Hooker
============

We'll hook your integrations up with Slack :)

Written in ES6/2015 with transpiling to ES5 via [Babel](http://babeljs.io)

## Features

* Slash commands
  * [Extension Number](./lib/slashCommands/ext/) = Lookup your colleague's extension number. Eg:
    * `/ext John` --> searches for John's extension number
    * `/ext` --> List all available extension numbers
  * [Continuous Integration server](./lib/slashCommands/ci/) = Trigger builds in your CI server. Eg:
    * `/ci build my-product`
    * `/ci release my-product 1.2.3-alpha`
    * `/ci deploy my-product 1.2.3-alpha`
  * [Pull Requests](./lib/slashCommands/prs/) = List a project Pull Requests from GitHub in a particular channel to facilitate code review and prioritization. Eg:
    * `/prs my-product`

## Requirements

  * [Slack](https://slack.com/) token and hook url: Get them from your "integrations" page
  * [Node.js](http://nodejs.org/) **OR** [Docker](https://www.docker.com/)

## Configuration

### General Configuration

#### ENV vars

The configuration variables are set via environment variables and/or using the `.env` file (environment variable has precedence over `.env` file).
This makes it easier to run the service also in Docker container according to your needs.

```
docker run -e PORT=5000 -e SLACK_TOKEN=123123 -e SLACK_DOMAIN=company -e SLACK_CHANNEL=channel -p 5000:5000 -d slack-hooker
```

If you want to use `.env` file, copy the `example.env` as `.env` and modify it as needed.

The GitHub credentials are only needed if you're planning to use the [`/prs`](./lib/slashCommands/prs/) commands.

#### Slash Commands

Every slash commands takes a `.json` with private data. See the README in each command's directory to learn how to configure / edit them. Basically, you'll have to copy the `*.example.json` to `*.json` and edit them to your needs `;-)`.

Important: if you're going to use a `.env` file AND using Docker, edit it before building the Dockerfile.

When running the service in Docker container, the config values can be provided as parameters:

### Slash Commands configuration

Each command takes its own set of custom configuration, stored separately as `.json` files.
Enter each command folder and edit the example file according to your needs. Then rename it from `*.json.example` to `*.json`

## Installation

You can install it in your own local infrastructure or in a cloud service like heroku.
Alternatively, you can build a Docker image and [deploy as container](#installation-using-docker)

  1. Set up a server address in your local infrastructure that will serve this application (eg: `slackapi.mycompany.com` or `slackapi.heroku.com`)
  2. Clone/download this repo to your chosen server
  3. Configure your application according to the "Configuration" section above
  4. Install NodeJS if you don't have it
  5. Run `npm install` in the app's root folder

  **Important note**: make sure you don't have any firewall blocking the incoming TCP port (default is PORT 5000 as defined in the "Configuration" section above)

## Installation using Docker

Service can also be installed & deployed using [Docker](https://www.docker.com/) containers,
which makes it easy to setup the environment without worrying about the requirements.

  1. Clone/download this repo
  2. Install Docker and start its service
  3. Build the Docker image: `npm run container:build`
  4. Start container with appropriate `-e` config parameters (or use `.env` file):

     docker run -e PORT=5000 -e SLACK_TOKEN=123123 -e SLACK_DOMAIN=company -e SLACK_CHANNEL=channel -p 5000:5000 -d slack-hooker

  5. Ensure the container is running (you should also be able to access the service using web browser: `http://<dockerhost>:5000/`).

**Note:** In Linux the `<dockerhost>` is `localhost`, within OSX's Boot2docker, use the IP reported by the command: `boot2docker ip`

## Usage

### Via pure node or npm

  1. Run `npm start` to fire up the application

### Via Docker

  1. Run `npm run container:build` to build the container
  2. Run `npm run container:run` to start the container and the server inside it

You can run `npm run | grep container:` to see other availables container actions.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
