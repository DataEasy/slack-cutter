'use strict';
var request = require('request');
var keys = Object.keys || require('object-keys');

// FIXME: Too much logic in a "toString". Remove it from here.
var toString = function(results, query) {
    var body = '';
    var header;

    if (results.length === 0) {
        return '[Nenhum Pull Request aberto]';
    }

    if (query === 'all') {
        header = 'Todos os Pull Requests abertos';
        for (var i in results) {
            body += results[i].title + '\n';
        }
    } else if (query === 'old') {
        header = 'Pull Requests com mais de 5 dias';
        var prDate;
        var date = new Date();
        var todaysDate = date.getFullYear() + (date.getMonth() + 1) + date.getDate();
        var prAgeInDays;
        for (i in results) {
            prDate = results[i].created_at;
            prDate = parseInt(prDate.slice(0, 4)) + parseInt(prDate.slice(5, 7)) + parseInt(prDate.slice(8, 10));
            prAgeInDays = todaysDate - prDate;
            if (prAgeInDays > 5) {
                body += results[i].title + '\n';
            }
        }
    } else {
        return '[Faltam parâmetros para executar o comando]';
    }

    return header + ':\n' + body;
};

module.exports = {
    search: function(repository, criteria, callback) {
        var options = {
            url: 'https://api.github.com/repos/dataeasy/' + repository + '/pulls?state=open',
            headers: { 'User-Agent': 'request' }
        };

        request(options, function (erro, response, body) {
            var objeto = JSON.parse(body);
            return callback(toString(objeto, criteria));
        });
    }
};
