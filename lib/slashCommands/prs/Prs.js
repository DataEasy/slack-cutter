'use strict';
var request = require('request');
var keys = Object.keys || require('object-keys');
var moment = require('moment');
var querystring = require('querystring');
var config = require('../../config');
var DAYS_THRESHOLD = 5;

var toString = function(results) {
    var prsNum = results.length;

    if (prsNum === 0) {
        return '[Nenhum PR aberto. Vai trabaiá, rapaz! :sweat_smile:]';
    }

    var header = prsNum === 1 ? '1 PR aberto:' : prsNum + ' PRs abertos:';
    var body = results.join('\n');

    return header + '\n\n' + body;
};

module.exports = {
    listPrs: function(repository, criteria, callback) {
        if (arguments.length <= 1) {
            throw new Error('At least one argument must be passed');
        }

        criteria = criteria || 'all';

        var queryParams = {
            state: 'open',
            sort: 'created',
            direction: 'asc'
        };

        var options = {
            url: 'https://api.github.com/repos/dataeasy/' + repository + '/pulls?' + querystring.stringify(queryParams),
            headers: { 'User-Agent': 'dataeasy' },
            auth: {
                user: config.githubUser,
                pass: config.githubToken
            }
        };

        request(options, function (err, response, body) {
            if (err) { return callback(err); }

            var prs;
            try {
                prs = JSON.parse(body);
            } catch (error) {
                console.log('Error parsing JSON', error);
                return callback(error);
            }

            var today = moment();
            var results = [];

            for (var i in prs) {
                var prDate = moment(prs[i].created_at);
                var prAge = today.diff(prDate, 'days');

                var isOldPr = prAge > DAYS_THRESHOLD;
                var line;

                if (criteria === 'all' || (criteria === 'old' && isOldPr)) {
                    //TODO: inserir emojis Slack
                    //TODO: links para o PR em questão
                    line = ' ⭠ ' + prs[i].title + ' :clock2: ' + prAge + 'd';
                    results.push(line);
                }
            }

            return callback(null, toString(results));
        });
    }
};
