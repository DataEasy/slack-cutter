'use strict';

var rewire = require('rewire');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var fs = require('fs');
var moment = require('moment');
var prsCommand = rewire('../../lib/slashCommands/prs/Prs');

var noop = function() {};
var dummyRes = { send: noop };

describe('PRs command', function () {
    var sampleGithubResponse;

    before(function() {
        try {
            sampleGithubResponse = fs.readFileSync('./test/slashCommands/github-response-example.json', { encoding: 'utf8' });
        } catch (e) {
            console.log('Error parsing sample JSON file', e);
        }
    });

    it('should receive at least one argument', function() {
        var fn = function() {
            prsCommand(dummyRes).listPrs();
        };
        expect(fn).to.throw(/At least one argument must be passed/);
    });

    it('should order by oldest creation date by default', function(done) {
        var restoreReq = prsCommand.__set__('request', function(options, callback) {
            expect(options.url).to.contain('sort=created');
            expect(options.url).to.contain('direction=asc');

            callback(null, {}, sampleGithubResponse);
        });

        prsCommand(dummyRes).listPrs('docflow', '', function(error, result) {
            var firstLine = result.split('\n\n')[1].split('\n')[0];
            var originalPrDate = moment('2015-03-25', 'YYYY-MM-DD');
            var today = moment();
            var diff = today.diff(originalPrDate, 'days');
            expect(firstLine).to.contain(diff + 'd');

            restoreReq();
            done();
        });
    });

    it('should list all open PRs by default', function(done) {
        var restoreReq = prsCommand.__set__('request', function(options) {
            expect(options.url).to.contain('state=open');
            done();
        });

        prsCommand(dummyRes).listPrs('docflow', noop);

        restoreReq();
    });

    it('should query github\'s URL based on the first argument', function(done) {
        var restoreReq = prsCommand.__set__('request', function(options) {
            expect(options.url).to.contain('github.com/repos/dataeasy/docflow/');
            done();
        });

        prsCommand(dummyRes).listPrs('docflow', noop);

        restoreReq();
    });
});
