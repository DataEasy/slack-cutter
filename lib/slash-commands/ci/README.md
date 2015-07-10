CI (Continuous Integration) Command
===================================

This command is for triggering jobs in your CI Server (here we use Jenkins).
We've built this command so we could remotely trigger jobs as simply as:

## Usage

    /ci release docflow 4.9.0

## Configuration

Rename `config.example.json` to `config.json` and edit it to your needs.
Note: `config.json` is gitignored so your particularities will never saved to git.

## Usage examples

    /ci build app-name reference
    /ci release app-name 4.9.0
    /ci deploy app-name 4.9.0
    /ci http://a-custom-job-url
