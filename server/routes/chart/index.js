const express = require('express');
const billboard = require('./billboard');

const router = express.Router();
router.use('/billboard', billboard);

module.exports = router;
