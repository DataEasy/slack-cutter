'use strict';

import fs from 'fs';

class Util {
    constructor() {
        return this;
    }

    readJsonFromFile(filePath, callback) {
        // FIXME This is ugly.
        // We shouldn't have to change code in order to run tests...
        if (process.env.NODE_ENV === 'TEST') {
            filePath = filePath.replace('.json', '.example.json');
        }
        fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
            if (err) {
                console.log('Error reading JSON file:', err);
                throw err;
            }
            try {
                callback(JSON.parse(data));
            } catch (jsonParseErr) {
                console.log('Bad JSON:', jsonParseErr.message);
                throw jsonParseErr;
            }
        });
    }

    readJsonFromFileSync(filePath) {
        try {
            const data = fs.readFileSync(filePath, { encoding: 'utf8' });
            try {
                return JSON.parse(data);
            } catch (err) {
                console.log('Bad JSON:', err.message);
                throw err;
            }
        } catch (err) {
            console.log('Error reading JSON file:', err);
            throw err;
        }
    }
}

export default new Util();
