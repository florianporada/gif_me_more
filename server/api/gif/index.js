'use strict';

var express = require('express');
var controller = require('./gif.controller');

var router = express.Router();

router.get('/:uuid', controller.index);
router.get('/:id', controller.show);
router.get('/get_gifs/:search_terms', controller.getGifs);
router.get('/uuid/:id', controller.getUuid);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
