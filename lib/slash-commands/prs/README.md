Pull Requests Command
=====================

We created this command so we could quickly see the opened PRs in our internal GitHub repos without having to open GitHub in the browser.

Also, we did some customization to make it easy for teams customize the command output based on their needs (labels, code review status, functional testing, and etc).

## Usage

    /prs name-of-repo

Where `name-of-repo` is the name of the repository you want to list the PRs from. Eg:

## Configuration

Rename `config.example.json` to `config.json` and edit it to your needs.
Note: `config.json` is gitignored so your particularities will never saved to git.

## Usage examples

The PRs from the repo: https://github.com/DataEasy/processos.git would be retrieved like this: `/prs processos`
