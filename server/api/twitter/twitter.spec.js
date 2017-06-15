'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var gifCtrlStub = {
  index: 'gifCtrl.index',
  show: 'gifCtrl.show',
  create: 'gifCtrl.create',
  upsert: 'gifCtrl.upsert',
  patch: 'gifCtrl.patch',
  destroy: 'gifCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var gifIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './gif.controller': gifCtrlStub
});

describe('Gif API Router:', function() {
  it('should return an express router instance', function() {
    expect(gifIndex).to.equal(routerStub);
  });

  describe('GET /api/gifs', function() {
    it('should route to gif.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'gifCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/gifs/:id', function() {
    it('should route to gif.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'gifCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/gifs', function() {
    it('should route to gif.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'gifCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/gifs/:id', function() {
    it('should route to gif.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'gifCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/gifs/:id', function() {
    it('should route to gif.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'gifCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/gifs/:id', function() {
    it('should route to gif.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'gifCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
