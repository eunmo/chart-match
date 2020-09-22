const express = require('express');
const fetchRouter = require('./fetch');
const match = require('./match');

const router = express.Router();
router.use('/fetch', fetchRouter);
router.use('/match', match);

module.exports = router;
