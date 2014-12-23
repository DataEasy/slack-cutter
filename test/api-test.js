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
            describe('GET /slashCommands/extensionNumber', function() {
                it('should return all extension numbers when invoked with no args', function (done) {
                    api.get('/slashCommands/extensionNumber')
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
                    api.get('/slashCommands/extensionNumber')
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

    describe('Incoming Hooks', function() {
        describe('BitBucket PR POST Hook parser', function() {
            var examplePostBody = {
                'pullrequest_approve':{
                    'date': '2013-11-05T02:03:03.551896+00:00',
                    'user': {
                        'display_name': 'Erik van Zijst',
                        'links': {
                            'avatar': {
                                'href': 'https://bitbucket-staging-assetroot.s3.amazonaws.com/c/photos/2013/Oct/28/evzijst-avatar-3454044670-3_avatar.png'
                            },
                            'self': {
                                'href': 'http://api.bitbucket.org/2.0/users/evzijst'
                            }
                        },
                        'username': 'evzijst'
                    }
                }
            };

            describe('POST /incomingHooks/bitbucket', function() {
                it('Should assume a default :channel param', function(done) {
                    api.post('/incomingHooks/bitbucket')
                    .send(examplePostBody)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) { return done(err); }
                        expect(res.text).toContain('*approved*');
                        expect(res.text).toContain(config.channel.substring(1));

                        done();
                    });
                });

                it('Should use a :channel param when provided', function(done) {
                    api.post('/incomingHooks/bitbucket/test-channel')
                    .send(examplePostBody)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) { return done(err); }
                        expect(res.text).toContain('*approved*');
                        expect(res.text).toContain('test-channel');

                        done();
                    });
                });
            });
        });
    });
});
