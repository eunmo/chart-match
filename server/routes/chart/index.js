const express = require('express');
const us = require('./us');
const jp = require('./jp');
const gb = require('./gb');
const kr = require('./kr');
const match = require('./match');

const router = express.Router();
router.use('/fetch/us', us);
router.use('/fetch/jp', jp);
router.use('/fetch/gb', gb);
router.use('/fetch/kr', kr);
router.use('/match', match);

module.exports = router;
