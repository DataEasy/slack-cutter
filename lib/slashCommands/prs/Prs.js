'use strict';
var request = require('request');
var keys = Object.keys || require('object-keys');
var DAYS_THRESHOLD = 5;

// FIXME: Too much logic in a "toString". Remove it from here.
var toString = function(header, body) {
    body = body || '';

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

            //TODO: Use moment.js
            var date = new Date();
            var todaysDate = date.getFullYear() + (date.getMonth() + 1) + date.getDate();
            var results = '';

            for (var i in prs) {
                var prDate = prs[i].created_at;
                //TODO: slice from ISO string
                prDate = parseInt(prDate.slice(0, 4)) + parseInt(prDate.slice(5, 7)) + parseInt(prDate.slice(8, 10));
                var prAge = todaysDate - prDate;

                var isOldPr = prAge > DAYS_THRESHOLD;

                if (criteria === 'all' || (criteria === 'old' && isOldPr)) {
                    results += prs[i].title + ' | ' + prAge + 'd\n';
                }
            }

            return callback(null, toString(header, results));
        });
    }
};
