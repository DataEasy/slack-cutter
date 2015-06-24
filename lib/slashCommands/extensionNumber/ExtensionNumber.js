'use strict';

var util = require('../../util');
var keys = Object.keys || require('object-keys');

var FILE = './lib/slashCommands/extensionNumber/extensionNumbers.json';

var toString = function(results, query) {
    var body = '';
    var resultsKeys = keys(results);
    var isFullList = !query;

    //TODO externalize and translate all strings in this method
    var header = isFullList ?
        'Todos os ramais' :
        'Ramais encontrados para `' + query + '`';

    if (resultsKeys.length === 0) {
        return '[Nenhum ramal encontrado]';
    }

    resultsKeys.forEach(function(element) {
        body += '\t' + element + ': ' + results[element] + '\n';
    });

    return header + ':\n' + body;
};

module.exports = {
    find: function() {
        var searchString;
        var callback = arguments[0];

        if (arguments.length === 2) {
            searchString = arguments[0].trim();
            callback = arguments[1];
        }

        util.readJsonFromFile(FILE, function(data) {
            var candidates = data.extensions;

            if (searchString) {
                candidates = {};
                keys(data.extensions).forEach(function(element) {
                    if (element.match(searchString) !== null) {
                        candidates[element] = data.extensions[element];
                    }
                });
                // Search through aliases:
                keys(data.aliases).forEach(function(element) {
                    if (element.match(searchString) !== null) {
                        var key = element + ' → ' + data.aliases[element];
                        candidates[key] = data.extensions[data.aliases[element]];
                    }
                });
            }

            return callback(toString(candidates, searchString));
        });
    }
};
