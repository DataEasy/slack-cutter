'use strict';

var keys = Object.keys || require('object-keys');
var buster = require('buster');
var extensionNumberCommand = require('../../lib/slashCommands/ExtensionNumber');
var util = require('../../lib/util');

// Make some functions global for BDD style
buster.spec.expose();
var expect = buster.expect;
var sinon = buster.sinon;

describe('Extension number Slash command', function () {
    var parsedJsonExtensions;

    beforeAll(function() {
        parsedJsonExtensions = {
            'luiz': 2322,
            'aline': 2307,
            'vinicius_carvalho': 2332,
            'vinicius.rodrigues': 2323
        };

        sinon.stub(util, 'readJsonFromFile').yields(parsedJsonExtensions);
    });

    it('should return the extension number for a known username', function (done) {
        extensionNumberCommand.find('luiz', function(result) {
            expect(result).toContain('luiz');
            expect(result).toContain(parsedJsonExtensions.luiz);

            done();
        });
    });

    it('should return more than one result if a given username is dubious', function(done) {
        extensionNumberCommand.find('vinicius', function(result) {
            expect(result).toContain('carvalho');
            expect(result).toContain('rodrigues');

            done();
        });
    });

    it('should return all elements when no argument is passed', function(done) {
        extensionNumberCommand.find(function(result) {
            var lineBreaksMatch = result.match(/\n/g);
            expect(lineBreaksMatch).toBeArray();
            expect(lineBreaksMatch.length).toEqual(keys(parsedJsonExtensions).length + 1);

            done();
        });
    });

    it('should return all elements when an empty argument is passed', function(done) {
        extensionNumberCommand.find('  \t', function(result) {
            var lineBreaksMatch = result.match(/\n/g);
            expect(lineBreaksMatch).toBeArray();
            expect(lineBreaksMatch.length).toEqual(keys(parsedJsonExtensions).length + 1);

            done();
        });
    });

    it('should return "[Nenhum ramal encontrado]" for when no results are found', function(done) {
        extensionNumberCommand.find('jacksonfive', function(result) {
            expect(result).toContain('[Nenhum ramal encontrado]');

            done();
        });
    });
});
