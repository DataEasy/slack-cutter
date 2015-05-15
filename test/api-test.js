'use strict';

var buster = require('buster');
var server = require('../server');
var config = require('../lib/config');
var supertest = require('supertest');
var api = supertest('http://localhost:' + config.port);

// Make some functions global for BDD style
buster.spec.expose();
var expect = buster.expect;

describe('API Testing', function () {
    beforeAll(function() {
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
                expect(res.text).toMatch('Set your hooks to point here.');

                done();
            });
    });

    describe('Slash Commands', function() {
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
                        expect(res.text).toMatch('Todos os ramais');

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
                        expect(res.text).toMatch('Ramais encontrados para');

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
                        expect(res.text).toMatch('At least one argument is necessary');

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
                        expect(res.text).toMatch('Only 1 or 3 arguments are accepted');

                        done();
                    });
                });
            });
        });
    });
});
