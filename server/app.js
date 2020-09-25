const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const routes = require('./routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static assets
app.use(express.static(path.join(__dirname, '../build')));

app.use('/', routes);

module.exports = app;
