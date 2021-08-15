const fs = require('fs');
const { URL } = require('url');

const fetch = require('node-fetch');
const config = require('config');

const token = config.get('appleMusicToken');

const print = false;
const path = 'server/apple/__mocks__/query-data.json';
const cache = JSON.parse(fs.readFileSync(path));

async function queryAppleMusic(url) {
  const response = await fetch(new URL(url), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (print) {
    const result = await response.json();
    cache[url] = result;
    const toWrite = JSON.stringify(cache, null, 2);
    fs.writeFileSync(path, toWrite);
    return result;
  }

  return response.json();
}

module.exports = queryAppleMusic;
