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

const request = require('request');

const consumerKey = 'y4Tc1l54xkD6r8Zv4DU8IVA24';
const consumerSecret = '3uqyWednL12XajCxo4OWnIdRLSrM597s6nnBrbdhDTFfBsBoAK';
const encodeSecret = new Buffer(`${consumerKey}:${consumerSecret}`).toString('base64');
let bearerToken = 'AAAAAAAAAAAAAAAAAAAAAAZr1AAAAAAAxermhu6G1OMk2JV7AmHpIWjSJeo%3DjSGAj4VBnd7jvQcmueNZexRFYQc1ivJHpzaUpRd7ykpMQhBUFI';

function getBearerToken() {
  const options = {
    url: 'https://api.twitter.com/oauth2/token',
    headers: {
      Authorization: `Basic ${encodeSecret}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: 'grant_type=client_credentials'
  };

  request.post(options, function(error, response, body) {
    //const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAAZr1AAAAAAAxermhu6G1OMk2JV7AmHpIWjSJeo%3DjSGAj4VBnd7jvQcmueNZexRFYQc1ivJHpzaUpRd7ykpMQhBUFI';
    bearerToken = JSON.parse(body).access_token;
  });
}

function getTwitterPlaces(lat, lng) {
  const regExp = new RegExp('^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}');
  if(regExp.exec(lat)) {
   //do nothing
  } else {
   //error
  }
  const apiEndpoint = `https://api.twitter.com/1.1/trends/closest.json?lat=${lat}&long=${lng}`;

  var options = {
    method: 'GET',
    url: apiEndpoint,
    qs: {
      screen_name: 'twitterapi'
    },
    json: true,
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  };

  return new Promise(function(resolve, reject) {
    request(options, function(err, res, body) {
      if(err) {
        reject(err);
      }
      //respondWithResult(body2);
      resolve(body);
    });
  });
}

function getTwitterTrendingByPlace(woeid) {
  const apiEndpoint = `https://api.twitter.com/1.1/trends/place.json?id=${woeid}`;

  var options = {
    method: 'GET',
    url: apiEndpoint,
    qs: {
      screen_name: 'twitterapi'
    },
    json: true,
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  };

  return new Promise(function(resolve, reject) {
    request(options, function(err, res, body) {
      if(err) {
        reject(err);
      }
      //respondWithResult(body2);
      resolve(body);
    });
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

// Gets a list of Gifs
export function index(req, res) {
  // return Gif.find().exec()
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));
}

// Gets a single Gif from the DB
export function show(req, res) {
  // return Gif.findById(req.params.id).exec()
  //   .then(handleEntityNotFound(res))
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));
}

// Gets places based on lat & long data
export function places(req, res) {
  return getTwitterPlaces(req.params.lat, req.params.lng).then(data => {
    res.status(200).send(data);
  });
}

// Gets tending topics  based on place id
export function trends(req, res) {
  return getTwitterTrendingByPlace(req.params.woeid).then(data => {
    res.status(200).send(data);
  });
}
