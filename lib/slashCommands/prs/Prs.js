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

var getPrLabels = function(pr) {
    return pr.labels.map(function(label) {
        return label.name;
    });
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
    var isPrApproved = prLabels.indexOf('Aprovação III') !== -1 || prLabels.indexOf('Aprovação IV+') !== -1;
    out += isPrApproved ? okMark : notOkMark;

    return out;
}

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
            url: 'https://api.github.com/repos/dataeasy/' + repository + '/issues?' + querystring.stringify(queryParams),
            headers: { 'User-Agent': 'dataeasy' },
            auth: {
                user: config.githubUser,
                pass: config.githubToken
            }
        };

        //TODO postback a slackbot message (hidden message) warning the user that we're fetching...

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

            // Any PR is an issue. But not all issues are PRs,
            // so let's filter issues that aren't PRs out:
            prs.filter(function(pr) {
                return pr.pull_request;
            }).forEach(function(pr) {
                // PR age:
                var prDate = moment(pr.created_at);
                var prAge = today.diff(prDate, 'days');
                var isOldPr = prAge > DAYS_THRESHOLD;
                var formattedAge = ' :clock2: ' + prAge + 'd.';

                // PR labels:
                var prLabels = getPrLabels(pr);
                var formattedLabels = formatLabels(prLabels);

                // PR type (Bug or Feature):
                var formattedType = formatType(prLabels);

                if (criteria === 'all' || (criteria === 'old' && isOldPr)) {
                    var line =  formattedAge + formattedLabels + ' → ' + formattedType + pr.title;
                    results.push(line);
                }
            });

            return callback(null, toString(results));
        });
    }
};
