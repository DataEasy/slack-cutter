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

let SHEET_CONFIG;

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
    constructor() {
        this.dataCache = {};
        this.attemptedToReadOnce = false;
        return this;
    }

    find () {
        let searchString;
        let callback = arguments[0];

        if (arguments.length === 2) {
            searchString = arguments[0].trim();
            callback = arguments[1];
        }

        if (!this.attemptedToReadOnce) {
            util.readJsonFromFile('google-spreadsheet-config.json', (err, data) => {
                this.attemptedToReadOnce = true;
                if (err) {
                    console.error('Could not read the Spreadsheet Configuration File.');
                    console.error(err);
                    return;
                }
                SHEET_CONFIG = data;
            });
        }

        if (SHEET_CONFIG) {
            if ('update' === searchString) {
                this.request(() => callback('Lista de ramais atualizada.') );//TODO: i18n
            } else {
                if (!this.dataCache.extensions) {
                    this.request(() => this.process(searchString, this.dataCache, afterRequestCallback) );
                } else {
                    this.process(searchString, this.dataCache, afterRequestCallback);
                }
            }
        } else {
            util.readJsonFromFile(FILE, data => {
                this.process(searchString, data, callback);
            });
        }
    }

    request(callback){// TORNAR PRIVADO
        sheet.requestSpreadsheet(SHEET_CONFIG.extensionsWorksheetId, SHEET_CONFIG.spreadsheetId, extensions => {
            sheet.requestSpreadsheet(SHEET_CONFIG.aliasesWorksheetId, SHEET_CONFIG.spreadsheetId, aliases => {
                this.dataCache = buildData(extensions, aliases);
                if (callback) {
                    callback();
                }
            });
        });
    }

    process(searchString, data, callback){// TORNAR PRIVADO
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
        return callback(toString(candidates, searchString));
    }

    buildData(extensions, aliases){ // TORNAR PRIVADO
        let data = {
            'extensions': {},
            'aliases': {}
        };

        for (var i in extensions) {
            data.extensions[extensions[i]['1']] = extensions[i]['2'];
        }
        for (var j in aliases) {
            data.aliases[aliases[j]['1']] = aliases[j]['2'];
        }
        return data;
    }

}

export default new Ext();
