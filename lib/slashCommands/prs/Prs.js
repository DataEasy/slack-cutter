'use strict';
var request = require('request');
var keys = Object.keys || require('object-keys');
var moment = require('moment');
var DAYS_THRESHOLD = 5;

// FIXME: Too much logic in a "toString". Remove it from here.
var toString = function(header, body) {
    body = body.join('\n');

    if (!body) {
        return '[Nenhum Pull Request aberto]';
    }

    return header + ':\n\n' + body;
};

module.exports = {
    listPrs: function(repository, criteria, callback) {
        if (arguments.length <= 1) {
            throw new Error('At least one argument must be passed');
        }

        criteria = criteria || 'all';

        var header = criteria === 'all' ?
            'Todos os Pull Requests abertos' :
            'Pull Requests com mais de ' + DAYS_THRESHOLD + ' dias';

        var options = {
            url: 'https://api.github.com/repos/dataeasy/' + repository + '/pulls?state=open&sort=created&direction=desc',
            headers: { 'User-Agent': 'request' }
        };

        request(options, function (err, response, body) {
            if (err) {
                return callback(err);
            }

            var prs;
            try {
                prs = JSON.parse(body);
            } catch (error) {
                console.log('Error parsing JSON', error);
                //TODO callback err
                throw error;
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
                    line = prs[i].title + ' | ' + prAge + 'd';
                    results.push(line);
                }
            }

            return callback(null, toString(header, results));
        });
    }
};
