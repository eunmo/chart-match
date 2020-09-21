const express = require('express');
const us = require('./us');
const gb = require('./gb');
const match = require('./match');

const router = express.Router();
router.use('/fetch/us', us);
router.use('/fetch/gb', gb);
router.use('/match', match);

module.exports = router;
