'use strict';

import http from 'http';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, {expect} from 'chai';
chai.use(sinonChai);

import Util from '../../lib/util';
import config from '../../lib/config';
import slackService from '../../lib/slack-service';
import ciCommand from '../../lib/slash-commands/ci/ci';

// Make some functions global for BDD style

describe('CI command', () => {
    const sandbox = sinon.sandbox.create();
    let httpGetStub;
    const parsedJsonCI = {
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

    beforeEach(() => {
        sandbox.stub(Util, 'readJsonFromFileSync').returns(parsedJsonCI);
        httpGetStub = sandbox.stub(http, 'get');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should be passed at least one argument', done => {
        const sendSimpleMessageStub = sandbox.stub(slackService, 'sendSimpleMessage');

        ciCommand.runTask([], err => {
            expect(err).not.to.be.null;
            expect(err.message).to.equal('At least one argument is necessary');
            expect(sendSimpleMessageStub).not.to.have.been.called;

            done();
        });
    });

    it('should fail on more than three arguments', done => {
        ciCommand.runTask(['arg1', 'arg2', 'arg3', 'arg4'], err => {
            expect(err).not.to.be.null;
            expect(err.message).to.equal('Only 1 or 3 arguments are accepted');

            done();
        });
    });

    it('should fail on two arguments', done => {
        ciCommand.runTask(['arg1', 'arg2'], err => {
            expect(err).not.to.be.null;
            expect(err.message).to.equal('Only 1 or 3 arguments are accepted');

            done();
        });
    });

    describe('One argument version', () => {
        it('should return the usage help if it\'s a "help" argument', done => {
            ciCommand.runTask(['help'], (err, out) => {
                expect(err).to.be.null;
                expect(out).to.contain('Usage:');

                done();
            });
        });

        it('should only accept a direct CI job url if not "help"', done => {
            ciCommand.runTask(['http://my-ci-server.com?my-custom-args=true'], err => {
                expect(err).to.be.null;
                expect(httpGetStub).to.have.been.calledOnce;

                done();
            });
        });

        it('should not accept any other url', done => {
            ciCommand.runTask(['http://google.com'], err => {
                expect(err).not.to.be.null;
                expect(err.message).to.equal('That does not appear do be a valid CI URL');

                done();
            });
        });

        it('should post back a confirmation msg for the requesting user', done => {
            const sendSimpleMessageStub = sandbox.stub(slackService, 'sendSimpleMessage');

            ciCommand.runTask(['http://my-ci-server.com?my-custom-args=true'], err => {
                expect(err).to.be.null;
                expect(sendSimpleMessageStub).to.have.been.called;

                done();
            });
        });
    });

    describe('Three argument version', () => {
        it('should take an application name, job name and version', done => {
            ciCommand.runTask(['release', 'myProduct', '4.8.0'], err => {
                expect(err).to.be.null;

                done();
            });
        });

        it('should invoke a job url if everything is rightly configured', done => {
            const tempToken = config.token;
            config.token = 'my_token';

            ciCommand.runTask(['release', 'myProduct', '4.8.0'], err => {
                expect(err).to.be.null;
                expect(httpGetStub).to.have.been.calledOnce;
                expect(httpGetStub).to.have.been.calledWithExactly('http://my-ci-server.com/job/My-Product-Release/build?delay=0sec&RELEASE_VERSION=4.8.0&token=my_token');

                config.token = tempToken;
                done();
            });
        });

        it('should bork on an unknown product name', done => {
            ciCommand.runTask(['release', 'unknown-app', '4.8.0'], err => {
                expect(err).not.to.be.null;
                expect(err.message).to.equal('Unknown product: `unknown-app`');

                done();
            });
        });

        it('should bork on an unknown job name', done => {
            ciCommand.runTask(['unknown-job', 'myProduct', '4.8.0'], err => {
                expect(err).not.to.be.null;
                expect(err.message).to.equal('Unknown job for `myProduct`: `unknown-job`');

                done();
            });
        });
    });
});
