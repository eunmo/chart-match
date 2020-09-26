const express = require('express');
const check = require('./check');
const current = require('./current');
const fetchRouter = require('./fetch');
const match = require('./match');
const select = require('./select');

const router = express.Router();
router.use('/check', check);
router.use('/current', current);
router.use('/fetch', fetchRouter);
router.use('/match', match);
router.use('/select', select);

module.exports = router;
