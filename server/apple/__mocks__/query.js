const queryData = require('./query-data.json');

async function queryAppleMusic(url) {
  return queryData[url];
}

module.exports = queryAppleMusic;
