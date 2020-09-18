const express = require('express');
const path = require('path');

const app = express();
const routes = require('./routes');

// Serve static assets
app.use(express.static(path.join(__dirname, '../build')));

app.use('/', routes);

module.exports = app;
