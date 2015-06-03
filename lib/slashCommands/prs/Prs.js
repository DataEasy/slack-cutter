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

var formatters = {
    docflow: function(pr) {
        // PR age:
        var prAge = getPrAge(pr);
        prAge = prAge < 10 ? '0' + prAge : prAge;
        var formattedAge = ' :calendar: ' + prAge + 'd.';

        // PR labels:
        var prLabels = getPrLabels(pr);
        var formattedLabels = formatLabels(prLabels);

        // PR type (Bug or Feature):
        var formattedType = formatType(prLabels);

        var line =  formattedAge + formattedLabels + ' → ' + formattedType + pr.title;

        return line;
    },

    defaultFormatter: function(pr) {
        // PR age:
        var prAge = getPrAge(pr);
        var formattedAge = ' :calendar: ' + prAge + 'd. → ';

        var line = formattedAge + pr.title;

        return line;
    }
};

var getPrLabels = function(pr) {
    return pr.labels.map(function(label) {
        return label.name;
    });
}

var getPrAge = function(pr) {
    var today = moment();
    var prDate = moment(pr.created_at);
    return today.diff(prDate, 'days');
}

var formatType = function(prLabels) {
    var out = '';

    var isBug = prLabels.indexOf('Erro') !== -1;
    var isFeature = prLabels.indexOf('Melhoria') !== -1;

    if (isBug) { out = '*E* '; }
    if (isFeature) { out = '*M* '; }

    return out;
};

var formatLabels = function(prLabels) {
    var okMark = ':white_check_mark:';
    var notOkMark = ':x:';
    var out = '';

    out += ' Teste Funcional: '
    var areTestsOk = prLabels.indexOf('Teste Caixa Preta OK') !== -1;
    out += areTestsOk ? okMark : notOkMark;

    out += ' Aprovações: ';

    var prApprovals;
    if (prLabels.indexOf('Aprovação IV+') !== -1) {
        prApprovals = okMark;
    } else if (prLabels.indexOf('Aprovação III') !== -1) {
        prApprovals = '    3';
    } else if (prLabels.indexOf('Aprovação II') !== -1) {
        prApprovals = '    2';
    } else if (prLabels.indexOf('Aprovação II') !== -1) {
        prApprovals = '    1';
    } else {
        prApprovals = notOkMark;
    }
    out += prApprovals;

    return out;
}

module.exports = function(httpResponse) {
    return {
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
                url: 'https://api.github.com/repos/dataeasy/' + repository + '/issues?' + querystring.stringify(queryParams),
                headers: { 'User-Agent': 'dataeasy' },
                auth: {
                    user: config.githubUser,
                    pass: config.githubToken
                }
            };

            httpResponse.send('Contactando GitHub. Os PRs serão listados no canal devido em breve. Aguarde. Sorria. :blush:');

            request(options, function (err, response, body) {
                if (err) { return callback(err); }

                var prs;
                try {
                    prs = JSON.parse(body);
                } catch (error) {
                    console.log('Error parsing JSON', error);
                    return callback(error);
                }

                var format = formatters[repository] || formatters.defaultFormatter;
                var results = [];

                // Any PR is an issue. But not all issues are PRs,
                // so let's filter issues that aren't PRs out:
                prs.filter(function(pr) {
                    return pr.pull_request;
                }).forEach(function(pr) {
                    var prAge = getPrAge(pr);
                    var isOldPr = prAge > DAYS_THRESHOLD;

                    if (criteria === 'all' || (criteria === 'old' && isOldPr)) {
                        var line = format(pr);
                        results.push(line);
                    }
                });

                var channel = require('./repoChannelMapping.json')[repository];

                return callback(null, toString(results), channel);
            });
        }
    };
};
