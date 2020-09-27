const express = require('express');
const check = require('./check');
const current = require('./current');
const edit = require('./edit');
const fetchRouter = require('./fetch');
const match = require('./match');
const search = require('./search');
const select = require('./select');

const router = express.Router();
router.use('/check', check);
router.use('/current', current);
router.use('/edit', edit);
router.use('/fetch', fetchRouter);
router.use('/match', match);
router.use('/search', search);
router.use('/select', select);

module.exports = router;
