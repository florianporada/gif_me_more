'use strict';

var express = require('express');
var controller = require('./twitter.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/places/:lat/:lng', controller.places);
router.get('/trends/:woeid', controller.trends);

module.exports = router;
