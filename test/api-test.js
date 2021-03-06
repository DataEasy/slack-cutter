'use strict';

import app from '../lib/app';

import supertest from 'supertest';
import sinonChai from 'sinon-chai';
import chai, {expect} from 'chai';
chai.use(sinonChai);

const api = supertest.agent(app.listen());

describe('API Testing', () => {
    before(() => process.env.NODE_ENV = 'TEST');

    it('ALL / should return default message', done => {
        api.get('/')
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.text).to.contain('Set your hooks to point here.');

                done();
            });
    });

    describe('Slash Commands', () => {
        describe('PRs', () => {
            describe('GET /slashCommands/prs', () => {
                it('should require at least one argument', done => {
                    api.get('/slashCommands/prs')
                        .query({
                            command: '/prs',
                            text: ''
                        })
                        .expect(400)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('At least one argument is necessary');

                            done();
                        });
                });

                it('should post a message to the requesting user indicating progress', done => {
                    api.get('/slashCommands/prs')
                        .query({
                            command: '/prs',
                            text: 'docflow'
                        })
                        .expect(200)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('Contactando GitHub.');

                            done();
                        });
                });

                it('should post a message to the requesting user indicating progress', done => {
                    api.get('/slashCommands/prs')
                        .query({
                            command: '/prs',
                            text: 'docflow'
                        })
                        .expect(200)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('Contactando GitHub.');

                            done();
                        });
                });
            });
        });

        describe('Extension Numbers', () => {
            describe('GET /slashCommands/ext', () => {
                it('should return all extension numbers when invoked with no args', done => {
                    api.get('/slashCommands/ext')
                        .query({
                            command: '/ramal',
                            text: ''
                        })
                        .expect(200)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('Todos os ramais');

                            done();
                        });
                });

                it('should return filtered extension numbers when invoked with an arg', done => {
                    api.get('/slashCommands/ext')
                        .query({
                            command: '/ramal',
                            text: 'barack'
                        })
                        .expect(200)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('Ramais encontrados para');

                            done();
                        });
                });
            });
        });

        describe('CI', () => {
            describe('GET /slashCommands/ci', () => {
                it('should be passed at least one argument', done => {
                    api.get('/slashCommands/ci')
                        .query({
                            command: '/ci',
                            text: ''
                        })
                        .expect(400)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('At least one argument is necessary');

                            done();
                        });
                });

                it('should fail on more than three arguments', done => {
                    api.get('/slashCommands/ci')
                        .query({
                            command: '/ci',
                            text: 'arg1 arg2 arg3 arg4'
                        })
                        .expect(400)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('Only 1 or 3 arguments are accepted');

                            done();
                        });
                });
            });
        });
    });
});
