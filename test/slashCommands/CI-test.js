'use strict';

var buster = require('buster');
var http = require('http');
var util = require('../../lib/util');
var config = require('../../lib/config');
var slackService = require('../../lib/slackService');
var ciCommand = require('../../lib/slashCommands/ci/CI');

// Make some functions global for BDD style
buster.spec.expose();
var expect = buster.expect;

describe('CI command', function () {
    var sandbox = buster.sinon.sandbox.create();
    var httpGetStub, readJsonFromFileSyncStub;
    var parsedJsonCI = {
        'CI_DOMAIN': 'my-ci-server.com',
        'productsJobs': {
            'myProduct': {
                'build': 'http://my-ci-server.com/job/My-Product-Build/build?delay=0sec',
                'release': 'http://my-ci-server.com/job/My-Product-Release/build?delay=0sec',
                'deploy': 'http://my-ci-server.com/job/My-Product-Deploy/build?delay=0sec',
                'SLACK_CHANNEL': 'myProduct'
            }
        }
    };

    beforeEach(function() {
        readJsonFromFileSyncStub = sandbox.stub(util, 'readJsonFromFileSync').returns(parsedJsonCI);
        httpGetStub = sandbox.stub(http, 'get');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should be passed at least one argument', function(done) {
        var sendSimpleMessageStub = sandbox.stub(slackService, 'sendSimpleMessage');

        ciCommand.runTask([], function(err) {
            expect(err).not.toBeNull();
            expect(err.message).toEqual('At least one argument is necessary');
            expect(sendSimpleMessageStub).not.toHaveBeenCalled();

            done();
        });
    });

    it('should fail on more than three arguments', function(done) {
        ciCommand.runTask(['arg1', 'arg2', 'arg3', 'arg4'], function(err) {
            expect(err).not.toBeNull();
            expect(err.message).toEqual('Only 1 or 3 arguments are accepted');

            done();
        });
    });

    it('should fail on two arguments', function(done) {
        ciCommand.runTask(['arg1', 'arg2'], function(err) {
            expect(err).not.toBeNull();
            expect(err.message).toEqual('Only 1 or 3 arguments are accepted');

            done();
        });
    });

    describe('One argument version', function () {
        it('should return the usage help if it\'s a "help" argument', function(done) {
            ciCommand.runTask(['help'], function(err, out) {
                expect(err).toBeNull();
                expect(out).toContain('Usage:');

                done();
            });
        });

        it('should only accept a direct CI job url if not "help"', function(done) {
            ciCommand.runTask(['http://my-ci-server.com?my-custom-args=true'], function(err) {
                expect(err).toBeNull();
                expect(httpGetStub).toHaveBeenCalledOnce();

                done();
            });
        });

        it('should not accept any other url', function(done) {
            ciCommand.runTask(['http://google.com'], function(err) {
                expect(err).not.toBeNull();
                expect(err.message).toEqual('That does not appear do be a valid CI URL');

                done();
            });
        });

        it('should post back a confirmation msg for the requesting user', function(done) {
            var sendSimpleMessageStub = sandbox.stub(slackService, 'sendSimpleMessage');

            ciCommand.runTask(['http://my-ci-server.com?my-custom-args=true'], function(err) {
                expect(err).toBeNull();
                expect(sendSimpleMessageStub).toHaveBeenCalled();

                done();
            });
        });
    });

    describe('Three argument version', function () {
        it('should take an application name, job name and version', function(done) {
            ciCommand.runTask(['release', 'myProduct', '4.8.0'], function(err) {
                expect(err).toBeNull();

                done();
            });
        });

        it('should invoke a job url if everything is rightly configured', function(done) {
            var tempToken = config.token;
            config.token = 'my_token';

            ciCommand.runTask(['release', 'myProduct', '4.8.0'], function(err) {
                expect(err).toBeNull();
                expect(httpGetStub).toHaveBeenCalledOnce();
                expect(httpGetStub).toHaveBeenCalledWithExactly('http://my-ci-server.com/job/My-Product-Release/build?delay=0sec&RELEASE_VERSION=4.8.0&token=my_token');

                config.token = tempToken;
                done();
            });
        });

        it('should bork on an unknown product name', function(done) {
            ciCommand.runTask(['release', 'unknown-app', '4.8.0'], function(err) {
                expect(err).not.toBeNull();
                expect(err.message).toEqual('Unknown product: `unknown-app`');

                done();
            });
        });

        it('should bork on an unknown job name', function(done) {
            ciCommand.runTask(['unknown-job', 'myProduct', '4.8.0'], function(err) {
                expect(err).not.toBeNull();
                expect(err.message).toEqual('Unknown job for `myProduct`: `unknown-job`');

                done();
            });
        });
    });
});
