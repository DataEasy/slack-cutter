import extCommand from '../../lib/slash-commands/ext/ext';
import util from '../../lib/util';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, {expect} from 'chai';
chai.use(sinonChai);

describe('Extension number Slash command', () => {
    let parsedJsonExtensions;

    before(() => {
        parsedJsonExtensions = {
            extensions: {
                'luiz': 2322,
                'barack': 2307,
                'vinicius_carvalho': 2332,
                'vinicius.rodrigues': 2323
            },
            aliases: {
                'gardenio': 'vinicius.rodrigues'
            }
        };

        sinon.stub(util, 'readJsonFromFile').yields(parsedJsonExtensions);
    });

    it('should return the extension number for a known username', done => {
        extCommand.find('luiz', result => {
            expect(result).to.contain('luiz');
            expect(result).to.contain(parsedJsonExtensions.extensions.luiz);

            done();
        });
    });

    it('should return more than one result if a given username is dubious', done => {
        extCommand.find('vinicius', result => {
            expect(result).to.contain('carvalho');
            expect(result).to.contain('rodrigues');

            done();
        });
    });

    it('should return all elements when no argument is passed', done => {
        extCommand.find(result => {
            const lineBreaksMatch = result.match(/\n/g);
            expect(lineBreaksMatch)
            .to.be.an('array')
            .and.to.have.length(Object.keys(parsedJsonExtensions.extensions).length + 1);

            done();
        });
    });

    it('should return all elements when an empty argument is passed', done => {
        extCommand.find('  \t', result => {
            const lineBreaksMatch = result.match(/\n/g);
            expect(lineBreaksMatch)
                .to.be.an('array')
                .and.to.have.length(Object.keys(parsedJsonExtensions.extensions).length + 1);

            done();
        });
    });

    it('should return "[Nenhum ramal encontrado]" for when no results are found', done => {
        extCommand.find('jacksonfive', result => {
            expect(result).to.contain('[Nenhum ramal encontrado]');

            done();
        });
    });

    it('should find items through aliases', done => {
        extCommand.find('gardenio', result => {
            expect(result).to.contain('rodrigues');

            done();
        });
    });
});
