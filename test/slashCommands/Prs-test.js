'use strict';

var rewire = require('rewire');

var buster = require('buster');
var prsCommand = rewire('../../lib/slashCommands/prs/Prs');

// Make some functions global for BDD style
buster.spec.expose();
var assert = buster.assert;
var expect = buster.expect;
var sinon = buster.sinon;

describe('PRs command', function () {
    it('should receive at least one argument', function() {
        assert.exception(function() {
            prsCommand.listPrs();
        }, { message: 'At least one argument must be passed' });
    });

    it('should order by oldest creation date by default', function(done) {
        var restoreReq = prsCommand.__set__('request', function(options) {
            expect(options.url).toContain('sort=created');
            expect(options.url).toContain('direction=desc');
            done();
        });

        prsCommand.listPrs('docflow', function() {});

        restoreReq();
    });

    it('should list all open PRs by default', function(done) {
        var restoreReq = prsCommand.__set__('request', function(options) {
            expect(options.url).toContain('state=open');
            done();
        });

        prsCommand.listPrs('docflow', function() {});

        restoreReq();
    });

    it('//should list PRs older than 5 days if "old" is passed');

    it('should query github\'s URL based on the first argument', function(done) {
        var restoreReq = prsCommand.__set__('request', function(options) {
            expect(options.url).toContain('github.com/repos/dataeasy/docflow/');
            done();
        });

        prsCommand.listPrs('docflow', function() {});

        restoreReq();
    });
});
