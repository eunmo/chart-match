const express = require('express');
const billboard = require('./billboard');
const gb = require('./gb');

const router = express.Router();
router.use('/billboard', billboard);
router.use('/gb', gb);

module.exports = router;
