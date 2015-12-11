'use strict';

import fs from 'fs';

class Util {
    static readJsonFromFile(filePath, callback) {
        // FIXME This is ugly.
        // We shouldn't have to change code in order to run tests...
        const isTestEnv = process.env.NODE_ENV === 'TEST';
        filePath = isTestEnv ? filePath.replace('.json', '.example.json'): filePath;
        fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            callback(err, JSON.parse(data));
        });
    }

    static readJsonFromFileSync(filePath) {
        const data = fs.readFileSync(filePath, { encoding: 'utf8' });
        return JSON.parse(data);
    }
}

export default Util;
