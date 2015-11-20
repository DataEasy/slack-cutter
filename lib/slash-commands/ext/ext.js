'use strict';

import util from '../../util';

// FIXME This is ugly.
// We shouldn't have to change code in order to run tests...
let fileName = 'config.json';
if (process.env.NODE_ENV === 'TEST') {
    fileName = fileName.replace('.json', '.example.json');
}
const FILE = `./lib/slash-commands/ext/${ fileName }`;

const toString = (results, query) => {
    let body = '';
    const resultsKeys = Object.keys(results);
    const isFullList = !query;

    // TODO externalize and translate all strings in this method
    const header = isFullList ?
        'Todos os ramais' :
        `Ramais encontrados para ${ query }`;

    if (resultsKeys.length === 0) {
        return '[Nenhum ramal encontrado]';
    }

    resultsKeys.forEach(element => {
        body += `\t${ element }: ${ results[element] }\n`;
    });

    return `${ header }:\n${ body }`;
};

class Ext {
    find() {
        let searchString;
        let callback = arguments[0];

        if (arguments.length === 2) {
            searchString = arguments[0].trim();
            callback = arguments[1];
        }

        util.readJsonFromFile(FILE, data => {
            let candidates = data.extensions;

            if (searchString) {
                candidates = {};
                Object.keys(data.extensions).forEach(element => {
                    if (element.match(searchString) !== null) {
                        candidates[element] = data.extensions[element];
                    }
                });
                // Search through aliases:
                Object.keys(data.aliases).forEach(element => {
                    if (element.match(searchString) !== null) {
                        const key = `${ element } → ${ data.aliases[element] }`;
                        candidates[key] = data.extensions[data.aliases[element]];
                    }
                });
            }

            return callback(toString(candidates, searchString));
        });
    }
}

export default new Ext();
