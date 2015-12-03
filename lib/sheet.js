import Spreadsheet from 'edit-google-spreadsheet';
import googleAuth from './google-auth';
import util from './util';

let SHEET_CONFIG;

class Sheet {
    constructor() {
        this.dataCache = {};
        return this;
    }

    fetch(searchString, processingCallback, afterRequestCallback){
        if (!this.dataCache.extensions) {
            this.updateCache(searchString, processingCallback, afterRequestCallback);
        } else {
            processingCallback(searchString, this.dataCache, afterRequestCallback);
        }
    }

    updateCache(searchString, processingCallback, afterRequestCallback){
        if (SHEET_CONFIG) {
            googleAuth.authenticate(tokens => {
                this.requestSpreadsheet(SHEET_CONFIG.extensionsWorksheetId, SHEET_CONFIG.spreadsheetId, tokens, (extensions) => {
                    this.requestSpreadsheet(SHEET_CONFIG.aliasesWorksheetId, SHEET_CONFIG.spreadsheetId, tokens, (aliases) => {
                        this.dataCache = this.buildData(extensions, aliases);
                        if (processingCallback) {
                            processingCallback(searchString, this.dataCache, afterRequestCallback);
                        }
                    });
                });
            });
        } else {
            util.readJsonFromFile('./google-spreadsheet-config.json', data => {
                SHEET_CONFIG = data;
                this.updateCache(searchString, processingCallback, afterRequestCallback);
            });
        }
    }

    requestSpreadsheet(worksheetId, spreadsheetId, tokens, callback){
        Spreadsheet.load({
            debug: false, //SWITCH TRUE/FALSE
            spreadsheetId: spreadsheetId,
            worksheetId: worksheetId,
            accessToken: {
                type: tokens.token_type,
                token: tokens.access_token
            }
        }, (err, data) => {
            if (err) {
                throw err;
            }
            data.receive((err, rows, info) => {
                if (err) {
                    throw err;
                }
                callback(rows);
            });
        });
    }

    buildData(extensions, aliases){
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

export default new Sheet();
