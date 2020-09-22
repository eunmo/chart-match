const express = require('express');
const check = require('./check');
const fetchRouter = require('./fetch');
const match = require('./match');

const router = express.Router();
router.use('/check', check);
router.use('/fetch', fetchRouter);
router.use('/match', match);

module.exports = router;
