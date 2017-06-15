'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newGif;

describe('Gif API:', function() {
  describe('GET /api/gifs', function() {
    var gifs;

    beforeEach(function(done) {
      request(app)
        .get('/api/gifs')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          gifs = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(gifs).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/gifs', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/gifs')
        .send({
          name: 'New Gif',
          info: 'This is the brand new gif!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newGif = res.body;
          done();
        });
    });

    it('should respond with the newly created gif', function() {
      expect(newGif.name).to.equal('New Gif');
      expect(newGif.info).to.equal('This is the brand new gif!!!');
    });
  });

  describe('GET /api/gifs/:id', function() {
    var gif;

    beforeEach(function(done) {
      request(app)
        .get(`/api/gifs/${newGif._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          gif = res.body;
          done();
        });
    });

    afterEach(function() {
      gif = {};
    });

    it('should respond with the requested gif', function() {
      expect(gif.name).to.equal('New Gif');
      expect(gif.info).to.equal('This is the brand new gif!!!');
    });
  });

  describe('PUT /api/gifs/:id', function() {
    var updatedGif;

    beforeEach(function(done) {
      request(app)
        .put(`/api/gifs/${newGif._id}`)
        .send({
          name: 'Updated Gif',
          info: 'This is the updated gif!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedGif = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedGif = {};
    });

    it('should respond with the updated gif', function() {
      expect(updatedGif.name).to.equal('Updated Gif');
      expect(updatedGif.info).to.equal('This is the updated gif!!!');
    });

    it('should respond with the updated gif on a subsequent GET', function(done) {
      request(app)
        .get(`/api/gifs/${newGif._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let gif = res.body;

          expect(gif.name).to.equal('Updated Gif');
          expect(gif.info).to.equal('This is the updated gif!!!');

          done();
        });
    });
  });

  describe('PATCH /api/gifs/:id', function() {
    var patchedGif;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/gifs/${newGif._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Gif' },
          { op: 'replace', path: '/info', value: 'This is the patched gif!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedGif = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedGif = {};
    });

    it('should respond with the patched gif', function() {
      expect(patchedGif.name).to.equal('Patched Gif');
      expect(patchedGif.info).to.equal('This is the patched gif!!!');
    });
  });

  describe('DELETE /api/gifs/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/gifs/${newGif._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when gif does not exist', function(done) {
      request(app)
        .delete(`/api/gifs/${newGif._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
