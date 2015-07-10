import proxyquire from 'proxyquire';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, {expect} from 'chai';
chai.use(sinonChai);

import fs from 'fs';
import moment from 'moment';

import CustomFormatter from '../../lib/slashCommands/prs/CustomFormatter';

const noop = () => {};
const dummyRes = { send: noop };

describe('PRs command', () => {
    let sampleGithubResponse;

    before(() => {
        process.env.NODE_ENV = 'TEST';
        try {
            sampleGithubResponse = fs.readFileSync('./test/slashCommands/github-response-example.json', { encoding: 'utf8' });
        } catch (e) {
            console.log('Error parsing sample JSON file', e);
        }
    });

    it('should receive at least one argument', () => {
        const fn = () => {
            const prsCommand = require('../../lib/slashCommands/prs/Prs');
            prsCommand(dummyRes).listPrs();
        };
        expect(fn).to.throw(/At least one argument must be passed/);
    });

    it('should order by oldest creation date by default', done => {
        const prsCommand = proxyquire('../../lib/slashCommands/prs/Prs', {
            'request': (options, callback) => {
                expect(options.url).to.contain('sort=created');
                expect(options.url).to.contain('direction=asc');

                callback(null, {}, sampleGithubResponse);
            }
        });

        prsCommand(dummyRes).listPrs('docflow', (error, result) => {
            const temp = result.split('\n\n')[1];
            const firstLine = temp.split('\n')[0];
            const originalPrDate = moment('2015-03-25', 'YYYY-MM-DD');
            const today = moment();
            const diff = today.diff(originalPrDate, 'days');
            expect(firstLine).to.contain(diff + 'd');

            done();
        });
    });

    it('should use the default formatter if no custom formatter for that repo', done => {
        const formatterSpy = sinon.spy(CustomFormatter, 'defaultFormatter');

        const prsCommand = proxyquire('../../lib/slashCommands/prs/Prs', {
            'request': (options, callback) => {
                callback(null, {}, sampleGithubResponse);
            },
            './CustomFormatter': {
                'defaultFormatter': formatterSpy
            }
        });

        prsCommand(dummyRes).listPrs('otherrepo', (error, result) => {
            expect(formatterSpy).to.have.been.called;

            done();
        });
    });

    it('should use custom formatters if present', done => {
        const formatterSpy = sinon.spy(CustomFormatter, 'docflow');

        const prsCommand = proxyquire('../../lib/slashCommands/prs/Prs', {
            'request': (options, callback) => {
                callback(null, {}, sampleGithubResponse);
            },
            './CustomFormatter': {
                'docflow': formatterSpy
            }
        });

        prsCommand(dummyRes).listPrs('docflow', (error, result) => {
            expect(formatterSpy).to.have.been.called;

            done();
        });
    });

    it('should list all open PRs by default', done => {
        const prsCommand = proxyquire('../../lib/slashCommands/prs/Prs', {
            'request': (options, callback) => {
                expect(options.url).to.contain('state=open');
                done();
            }
        });

        prsCommand(dummyRes).listPrs('docflow', noop);
    });

    it('should query github\'s URL based on the first argument', done => {
        const prsCommand = proxyquire('../../lib/slashCommands/prs/Prs', {
            'request': (options, callback) => {
                expect(options.url).to.contain('github.com/repos/dataeasy/docflow/');
                done();
            }
        });

        prsCommand(dummyRes).listPrs('docflow', noop);
    });
});
