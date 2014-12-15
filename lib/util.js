'use strict';

var fs = require('fs');

module.exports = {
    truncate: function (string) {
        var MAX_LENGTH = 100;

        if (string.length > MAX_LENGTH) {
            return string.substring(0, MAX_LENGTH) + ' [...]';
        }

        return string;
    },

    getPossiblyUndefinedKeyValue: function (obj, keySequence) {
        var keys = keySequence.split('.');

        while (obj && keys.length) {
            obj = obj[keys.shift()];
        }

        return obj || undefined;
    },

    COLORS: {
        red: '#ff0000',
        green: '#00ff00',
        blue: '#0000ff',
        yellow: '#ffff00'
    },

    readJsonFromFile: function(filePath, callback) {
        fs.readFile(filePath, { encoding: 'utf8' }, function(err, data) {
            if (err) {
                console.log('Error reading JSON file:', err);
                throw err;
            }

            try {
                callback(JSON.parse(data));
            } catch (er) {
                console.log('Bad JSON:', er.message);
                throw er;
            }
        });
    }
};

