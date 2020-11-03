const { dml, query } = require('@eunmo/mysql');

function add(store, artist) {
  return dml(`
    INSERT INTO favoriteArtists (store, artist)
    VALUES ('${store}', '${artist}')`);
}

function get(store) {
  return query(`
    SELECT artist
    FROM favoriteArtists
    WHERE store = '${store}'`);
}

module.exports = { add, get };
