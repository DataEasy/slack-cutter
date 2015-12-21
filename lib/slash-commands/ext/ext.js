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
        this._attemptedToReadSpreadsheetConfigOnce = false;
        return this;
    }

    getExtension () {
        let searchString;
        let callback = arguments[0];

        if (arguments.length === 2) {
            searchString = arguments[0].trim();
            callback = arguments[1];
        }

        this._readConfig(() => this._handle(searchString, callback));
    }

    _readConfig(callback) {
        if (this._attemptedToReadSpreadsheetConfigOnce) {//if we already tried to load the config file on a previous request...
            callback();
        } else {//if we never tried to load to config file we should try once...
            let sheetConfigFileName;
            if (process.env.NODE_ENV === 'TEST') {// FIXME This is ugly. We shouldn't have to change code in order to run tests...
                sheetConfigFileName = './lib/slash-commands/ext/google-spreadsheet-config.example.json';
            } else {
                sheetConfigFileName = './lib/slash-commands/ext/google-spreadsheet-config.json';
            }
            util.readJsonFromFile(sheetConfigFileName, (err, data) => {
                this._attemptedToReadSpreadsheetConfigOnce = true; //flag the attempt so we don't have to try again
                if (err) {
                    console.log('Could not read the Spreadsheet Configuration File.');
                }
                SHEET_CONFIG = data;
                callback();
            });
        }
    }

    _handle(searchString, callback) {
        if (SHEET_CONFIG) {//if there's a config file we assume we should search the extension in the Spreadsheet
            if ('update' === searchString) {//the user is asking us to update the cached extensions
                this._requestSpreadsheet(() => callback('Lista de ramais atualizada.') );//request the spreadsheet and store its data
            } else {
                if (!this.dataCache.extensions) {//if there's no cache saved...
                    this._requestSpreadsheet(() => processData(searchString, this.dataCache, callback) );//request the spreadsheet and search the extension in it
                } else {//if already there's cached data...
                    processData(searchString, this.dataCache, callback);//do the search for the extension
                }
            }
        } else {//if there's no config file we assume we have to search the extension in a file
            util.readJsonFromFile(FILE, (err, data) => {
                if (err) {
                    console.error('Could not read the extensions from the File.');
                    console.error(err);
                    return;
                }
                processData(searchString, data, callback);//do the search for the extension
            });
        }
    }

    _requestSpreadsheet(callback) {
        sheet.requestSpreadsheet(SHEET_CONFIG.extensionsWorksheetId, SHEET_CONFIG.spreadsheetId, extensions => {
            sheet.requestSpreadsheet(SHEET_CONFIG.aliasesWorksheetId, SHEET_CONFIG.spreadsheetId, aliases => {
                this.dataCache = buildData(extensions, aliases);
                if (callback) {
                    callback();
                }
            });
        });
    }

}

const processData = (searchString, data, callback) => {
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
};

const buildData = (extensions, aliases) => {
    let data = {
        'extensions': {},
        'aliases': {}
    };

    Object.getOwnPropertyNames(extensions).forEach((i) => {
        data.extensions[extensions[i]['1']] = extensions[i]['2'];
    });

    Object.getOwnPropertyNames(aliases).forEach((i) => {
        data.aliases[aliases[i]['1']] = aliases[i]['2'];
    });
    return data;
};

export default new Ext();
