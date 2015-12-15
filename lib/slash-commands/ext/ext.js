'use strict';

import googleAuth from '../../google-auth';
import sheet from '../../sheet';
import config from '../../config';
import util from '../../util';

// FIXME This is ugly.
// We shouldn't have to change code in order to run tests...
let configFileName = 'config.json';
if (process.env.NODE_ENV === 'TEST') {
    configFileName = configFileName.replace('.json', '.example.json');
}
const FILE = `./lib/slash-commands/ext/${ configFileName }`;

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

        switch(config.extMode){
            default:
            case 'SHEET':
                sheet.fetch(searchString, this.process, callback);
                break;
            case 'FILE':
                util.readJsonFromFile(FILE, data => {
                    this.process(searchString, data, callback);
                });
                break;
        }
    }

    update(searchString, afterRequestCallback) {
        sheet.updateCache(searchString, this.process, afterRequestCallback);
    }

    process(searchString, data, afterRequestCallback){
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
                    let key = `${ element } → ${ data.aliases[element] }`;
                    candidates[key] = data.extensions[data.aliases[element]];
                }
            });
        }
        return afterRequestCallback(toString(candidates, searchString));
    }

}

export default new Ext();

const toString = (results, query) => {
    let body = '';
    const resultsKeys = Object.keys(results);
    const isFullList = !query;

    //TODO externalize and translate all strings in this method
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
