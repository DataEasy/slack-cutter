'use strict';

var server = require('../lib/server');
var config = require('../lib/config');
var supertest = require('supertest');
var api = supertest('http://localhost:' + config.port);

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

describe('API Testing', function () {
    before(function() {
        server.start().on('error', function(e) {
            if (e.code === 'EADDRINUSE') {
                console.log('Server already started. Reusing it.');
            } else {
                console.log(e);
            }
        });
    });

    it('ALL / should return default message', function(done) {
        api.get('/')
            .expect(200)
            .end(function(err, res) {
                if (err) { return done(err); }
                expect(res.text).to.contain('Set your hooks to point here.');

                done();
            });
    });

    describe('Slash Commands', function() {
        describe('PRs', function() {
            describe('GET /slashCommands/prs', function() {
                it('should require at least one argument', function (done) {
                    api.get('/slashCommands/prs')
                        .query({
                            command: '/prs',
                            text: ''
                        })
                        .expect(400)
                        .end(function(err, res) {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('At least one argument is necessary');

                            done();
                        });
                });
            });
        });

        describe('Extension Numbers', function() {
            describe('GET /slashCommands/ext', function() {
                it('should return all extension numbers when invoked with no args', function (done) {
                    api.get('/slashCommands/ext')
                        .query({
                            command: '/ramal',
                            text: ''
                        })
                        .expect(200)
                        .end(function(err, res) {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('Todos os ramais');

                            done();
                        });
                });

                it('should return filtered extension numbers when invoked with a arg', function (done) {
                    api.get('/slashCommands/ext')
                        .query({
                            command: '/ramal',
                            text: 'luiz'
                        })
                        .expect(200)
                        .end(function(err, res) {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('Ramais encontrados para');

                            done();
                        });
                });
            });
        });

        describe('CI', function() {
            describe('GET /slashCommands/ci', function() {
                it('should be passed at least one argument', function (done) {
                    api.get('/slashCommands/ci')
                        .query({
                            command: '/ci',
                            text: ''
                        })
                        .expect(400)
                        .end(function(err, res) {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('At least one argument is necessary');

                            done();
                        });
                });

                it('should fail on more than three arguments', function (done) {
                    api.get('/slashCommands/ci')
                        .query({
                            command: '/ci',
                            text: 'arg1 arg2 arg3 arg4'
                        })
                        .expect(400)
                        .end(function(err, res) {
                            if (err) { return done(err); }
                            expect(res.text).to.contain('Only 1 or 3 arguments are accepted');

                            done();
                        });
                });
            });
        });
    });
});
