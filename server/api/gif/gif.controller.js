/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/gifs              ->  index
 * POST    /api/gifs              ->  create
 * GET     /api/gifs/:id          ->  show
 * PUT     /api/gifs/:id          ->  upsert
 * PATCH   /api/gifs/:id          ->  patch
 * DELETE  /api/gifs/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Gif from './gif.model';
import env from './../../config/local.env';
import request from 'request';
import uuidV4 from 'uuid/v4';

function getGiphyGifs(searchTerms) {
  const apiKey = env.GIPHY_API_KEY;
  let apiEndpoint = `http://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=`;
  let result = [];
  let options = {
    method: 'GET',
    url: apiEndpoint,
    json: true,
    timeout: 10000,
    followRedirect: true,
    maxRedirects: 10
  };

  searchTerms = JSON.parse(searchTerms);

  return new Promise(function(resolve, reject) {
    for(let i = 0; i < searchTerms.length; i++) {
      options.url = apiEndpoint + searchTerms[i];
      request(options, function(err, res, body) {
        if(err) {
          return reject(err);
        }

        result = result.concat(body.data);

        if(i == searchTerms.length - 1) {
          return resolve(result);
        }
      });
    }
  });
}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Gifs based on uuid
export function index(req, res) {
  return Gif.find({uuid: req.params.uuid}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Gif from the DB
export function show(req, res) {
  return Gif.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Gif in the DB
export function create(req, res) {
  return Gif.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Gif in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Gif.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Gif in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Gif.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Gif from the DB
export function destroy(req, res) {
  return Gif.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Gets all gives from a search string
export function getGifs(req, res) {
  return getGiphyGifs(req.params.search_terms).then(data => {
    res.status(200).send(data);
  });
}

// Gets random UUID to identify user
export function getUuid(req, res) {
  return res.status(200).send(uuidV4());
}
