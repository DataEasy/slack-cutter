'use strict';

import fs from 'fs';

class Util {
    static readJsonFromFile(filePath, callback) {
        // FIXME This is ugly.
        // We shouldn't have to change code in order to run tests...
        const isTestEnv = process.env.NODE_ENV === 'TEST';
        filePath = isTestEnv ? filePath.replace('.json', '.example.json'): filePath;
        fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
            callback(err, data ? JSON.parse(data) : undefined);
        });
    }

    static readJsonFromFileSync(filePath) {
        const data = fs.readFileSync(filePath, { encoding: 'utf8' });
        return data ? JSON.parse(data) : undefined;
    }

    static checkFileExists(filePath, callback) {
        fs.stat(filePath,  (err, stats) => callback(stats.isFile()) );
    }
}

export default Util;
