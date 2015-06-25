'use strict';

var keys = Object.keys || require('object-keys');
var buster = require('buster');
var extCommand = require('../../lib/slashCommands/ext/Ext');
var util = require('../../lib/util');

// Make some functions global for BDD style
buster.spec.expose();
var expect = buster.expect;
var sinon = buster.sinon;

describe('Extension number Slash command', function () {
    var parsedJsonExtensions;

    beforeAll(function() {
        parsedJsonExtensions = {
            extensions: {
                'luiz': 2322,
                'aline': 2307,
                'vinicius_carvalho': 2332,
                'vinicius.rodrigues': 2323
            },
            aliases: {
                'gardenio': 'vinicius.rodrigues'
            }
        };

        sinon.stub(util, 'readJsonFromFile').yields(parsedJsonExtensions);
    });

    it('should return the extension number for a known username', function (done) {
        extCommand.find('luiz', function(result) {
            expect(result).toContain('luiz');
            expect(result).toContain(parsedJsonExtensions.extensions.luiz);

            done();
        });
    });

    it('should return more than one result if a given username is dubious', function(done) {
        extCommand.find('vinicius', function(result) {
            expect(result).toContain('carvalho');
            expect(result).toContain('rodrigues');

            done();
        });
    });

    it('should return all elements when no argument is passed', function(done) {
        extCommand.find(function(result) {
            var lineBreaksMatch = result.match(/\n/g);
            expect(lineBreaksMatch).toBeArray();
            expect(lineBreaksMatch.length).toEqual(keys(parsedJsonExtensions.extensions).length + 1);

            done();
        });
    });

    it('should return all elements when an empty argument is passed', function(done) {
        extCommand.find('  \t', function(result) {
            var lineBreaksMatch = result.match(/\n/g);
            expect(lineBreaksMatch).toBeArray();
            expect(lineBreaksMatch.length).toEqual(keys(parsedJsonExtensions.extensions).length + 1);

            done();
        });
    });

    it('should return "[Nenhum ramal encontrado]" for when no results are found', function(done) {
        extCommand.find('jacksonfive', function(result) {
            expect(result).toContain('[Nenhum ramal encontrado]');

            done();
        });
    });

    it('should find items through aliases', function(done) {
         extCommand.find('gardenio', function(result) {
            expect(result).toContain('rodrigues');

            done();
        });
    });
});
