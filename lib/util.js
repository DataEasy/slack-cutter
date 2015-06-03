'use strict';

var fs = require('fs');

function Util() { return this; }

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
