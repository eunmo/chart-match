const express = require('express');
const path = require('path');

const chart = require('./chart');
const search = require('./search');
const shuffle = require('./shuffle');

const router = express.Router();
router.use('/api/chart', chart);
router.use('/api/search', search);
router.use('/api/shuffle', shuffle);

router.get('*', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

module.exports = router;
