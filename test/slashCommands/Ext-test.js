'use strict';

var keys = Object.keys || require('object-keys');
var extCommand = require('../../lib/slashCommands/ext/Ext');
var util = require('../../lib/util');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

describe('Extension number Slash command', function () {
    var parsedJsonExtensions;

    before(function() {
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
            expect(result).to.contain('luiz');
            expect(result).to.contain(parsedJsonExtensions.extensions.luiz);

            done();
        });
    });

    it('should return more than one result if a given username is dubious', function(done) {
        extCommand.find('vinicius', function(result) {
            expect(result).to.contain('carvalho');
            expect(result).to.contain('rodrigues');

            done();
        });
    });

    it('should return all elements when no argument is passed', function(done) {
        extCommand.find(function(result) {
            var lineBreaksMatch = result.match(/\n/g);
            expect(lineBreaksMatch)
                .to.be.an('array')
                .and.to.have.length(keys(parsedJsonExtensions.extensions).length + 1);

            done();
        });
    });

    it('should return all elements when an empty argument is passed', function(done) {
        extCommand.find('  \t', function(result) {
            var lineBreaksMatch = result.match(/\n/g);
            expect(lineBreaksMatch)
                .to.be.an('array')
                .and.to.have.length(keys(parsedJsonExtensions.extensions).length + 1);

            done();
        });
    });

    it('should return "[Nenhum ramal encontrado]" for when no results are found', function(done) {
        extCommand.find('jacksonfive', function(result) {
            expect(result).to.contain('[Nenhum ramal encontrado]');

            done();
        });
    });

    it('should find items through aliases', function(done) {
         extCommand.find('gardenio', function(result) {
            expect(result).to.contain('rodrigues');

            done();
        });
    });
});
