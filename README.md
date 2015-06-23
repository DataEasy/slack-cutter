[![Build Status](http://ci.dataeasy.com.br/buildStatus/icon?job=(SlackHooker) Master Builder)](http://ci.dataeasy.com.br/job/(SlackHooker) Master Builder)

Slack Hooker
============

We'll hook your integrations up with Slack :)

## Features

* Slash commands
  * Extension Number = Lookup your colleague's extension number from Slack (ex: `/ext John`)
  * Continuous Integrations commands (tested with Jenkins but should work regardless):
    * `/build` command (ex: `/build my-product`)
    * `/release` command (ex: `/release my-product 1.2.3-alpha`)
    * `/deploy` command (ex: `/deploy my-product 1.2.3-alpha`)
* Incoming Hooks
  *  BitBucket Pull Request integrations = Get notified when something happens over your BB's PRs.
    * **(Warning: removed since version 0.2)**. Use [this](https://github.com/lfilho/bitbucket-slack-pr-hook) instead.

## Requirements

  * [Slack](https://slack.com/) channel token: Get your Slack token from your "integrations" page
  * [Node.js](http://nodejs.org/) **OR** [Docker](https://www.docker.com/)

## Configuration

### General Configuration

The configuration variables are set via environment variables and/or using `.env` file (environment variable takes preference over `.env` file if found).
This makes it easy to run service also in Docker container.

If you want to use `.env` file, copy the `example.env` as `.env` and modify it as needed:

```
PORT=5000
SLACK_TOKEN=getfromslack
SLACK_DOMAIN=mycompany
SLACK_CHANNEL=mychannel
SLACK_USERNAME=MyAwesomeBot
```

Important: if you're going to use a `.env` file AND using Docker, edit it before building the Dockerfile.

When running the service in Docker container, the config values can be provided as parameters:

```
# Starts Docker container in daemonized mode
docker run -e PORT=5000 -e SLACK_TOKEN=123123 \
  -e SLACK_DOMAIN=company -e SLACK_CHANNEL=channel \
  -p 5000:5000 -d slack-hooker
```

### Slash Commands configuration

Each command takes its own set of custom configuration, stored separately as `.json` files.
Enter each command folder and edit the example file according to your needs. Then rename it from `...json.example` to `...json`

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
  2. Install Docker (using system packages in Linux, in Windows or Mac OS X you can use [Boot2docker](http://boot2docker.io/))
  3. Start Docker service (or `boot2docker up`)
  4. Build the Docker image:

        # Alternatively: npm run build-container
        docker build -t slack-hooker .

  5. Start container with appropriate `-e` config parameters:

        docker run -e PORT=5000 -e SLACK_TOKEN=123123 \
          -e SLACK_DOMAIN=company -e SLACK_CHANNEL=channel \
          -p 5000:5000 -d slack-hooker

  6. Ensure the container is running (you should also be able to access the service using web browser: `http://<dockerhost>:5000/`).

     **Note:** In Linux the `<dockerhost>` is `localhost`, with Boot2docker use the IP reported by the command: `boot2docker ip`

## Use

### Via plain node or npm

  1. Run `npm start` (or `node server.js`) to fire up the application (you can do `node server.js &` to run it as a daemon in your Linux box)

### Via Docker

  1. Run `npm run build-container` to build the container
  2. Run `npm run start-container` to start the container and the server inside it
  3. When needed, you can use `npm run stop-container` and `npm run reload-container`
