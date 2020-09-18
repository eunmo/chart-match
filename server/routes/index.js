const express = require('express');
const path = require('path');

const chart = require('./chart');

const router = express.Router();
router.use('/api/chart/', chart);

router.get('*', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

module.exports = router;
