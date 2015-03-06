'use strict';

var fs = require('fs');

function Util() { return this; }

Util.prototype.truncate = function (string) {
    var MAX_LENGTH = 100;

    if (string.length > MAX_LENGTH) {
        return string.substring(0, MAX_LENGTH) + ' [...]';
    }

    return string;
};

Util.prototype.getPossiblyUndefinedKeyValue = function (obj, keySequence) {
    var keys = keySequence.split('.');

    while (obj && keys.length) {
        obj = obj[keys.shift()];
    }

    return obj || undefined;
};

Util.prototype.COLORS = {
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#ffff00'
};

Util.prototype.readJsonFromFile = function (filePath, callback) {
    fs.readFile(filePath, { encoding: 'utf8' }, function (err, data) {
        if (err) {
            console.log('Error reading JSON file:', err);
            throw err;
        }

        try {
            callback(JSON.parse(data));
        } catch (err) {
            console.log('Bad JSON:', err.message);
            throw err;
        }
    });
};

Util.prototype.readJsonFromFileSync = function (filePath) {
    try {
        var data = fs.readFileSync(filePath, { encoding: 'utf8' });

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
};

module.exports = new Util();
