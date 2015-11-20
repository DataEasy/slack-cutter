'use strict';

import fs from 'fs';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, {expect} from 'chai';
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();

import Util from '../lib/util';

describe('Util', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('should read and parse a json from a file', done => {
        const filePath = './test/slash-commands/github-response-example.json';

        const data = Util.readJsonFromFileSync(filePath);

        expect(data[0].url).to.exist;
        done();
    });

    it('should load a .example file when on test env', done => {
        const filePath = './will-not-exist.json';

        const readFileStub = sandbox.stub(fs, 'readFile', filePath => {
            expect(filePath).to.contain('example.json');
            done();
        });

        Util.readJsonFromFile(filePath);
    });

    it('should NOT load a .example file when NOT on test env', done => {
        const filePath = './will-not-exist.json';

        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'DEV';

        const readFileStub = sandbox.stub(fs, 'readFile', filePath => {
            expect(filePath).to.not.contain('example.json');
            done();
        });

        Util.readJsonFromFile(filePath);

        process.env.NODE_ENV = originalEnv;
    });
});
