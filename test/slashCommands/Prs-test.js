'use strict';

var rewire = require('rewire');

var buster = require('buster');
var fs = require('fs');
var moment = require('moment');
var prsCommand = rewire('../../lib/slashCommands/prs/Prs');

// Make some functions global for BDD style
buster.spec.expose();
var assert = buster.assert;
var expect = buster.expect;
var sinon = buster.sinon;

var noop = function() {};
var dummyRes = { send: noop };

describe('PRs command', function () {
    var sampleGithubResponse;

    beforeAll(function() {
        try {
            sampleGithubResponse = fs.readFileSync('./test/slashCommands/github-response-example.json', { encoding: 'utf8' });
        } catch (e) {
            console.log('Error parsing sample JSON file', e);
        }
    });

    it('should receive at least one argument', function() {
        assert.exception(function() {
            prsCommand(dummyRes).listPrs();
        }, { message: 'At least one argument must be passed' });
    });

    it('should order by oldest creation date by default', function(done) {
        var restoreReq = prsCommand.__set__('request', function(options, callback) {
            expect(options.url).toContain('sort=created');
            expect(options.url).toContain('direction=asc');

            callback(null, {}, sampleGithubResponse)
        });

        prsCommand(dummyRes).listPrs('docflow', '', function(error, result) {
            var firstLine = result.split('\n\n')[1].split('\n')[0];
            var originalPrDate = moment('2015-06-03T02:13:53Z');
            var today = moment();
            var diff = today.diff(originalPrDate, 'days');
            expect(firstLine).toContain(diff + 'd');

            restoreReq();
            done();
        });
    });

    it('should list all open PRs by default', function(done) {
        var restoreReq = prsCommand.__set__('request', function(options) {
            expect(options.url).toContain('state=open');
            done();
        });

        prsCommand(dummyRes).listPrs('docflow', noop);

        restoreReq();
    });

    it('//should filter prs older than 5 days if "old" is passed as a criteria');

    it('should query github\'s URL based on the first argument', function(done) {
        var restoreReq = prsCommand.__set__('request', function(options) {
            expect(options.url).toContain('github.com/repos/dataeasy/docflow/');
            done();
        });

        prsCommand(dummyRes).listPrs('docflow', noop);

        restoreReq();
    });
});
