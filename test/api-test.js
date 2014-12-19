'use strict';

var buster = require('buster');
var server = require('../server');
var config = require('../lib/config');
var supertest = require('supertest');
var api = supertest('http://localhost:'+ config.port);

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
        describe('Ramal', function() {
            it('GET /slashCommands/ramal invoked with no args should return all extension numbers',function (done) {
                api.get('/slashCommands/ramal')
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

            it('GET /slashCommands/ramal invoked with a arg should return filtered extension numbers',function (done) {
                api.get('/slashCommands/ramal')
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
});
