const { dml, query } = require('@eunmo/mysql');
const { format } = require('./util');

function add(store, id, gid, name, url, artwork) {
  const values = [store, id, gid, name, url].map(format);
  return dml(`
    INSERT INTO favoriteArtists (store, id, gid, name, url, artwork)
    VALUES (${values.join(',')}, ${format(artwork)})`);
}

function edit(store, id, gid) {
  return dml(`
    UPDATE favoriteArtists
    SET gid = ${format(gid)}
    WHERE store = ${format(store)}
    AND id = ${format(id)}`);
}

function remove(store, id) {
  return dml(`
    DELETE FROM favoriteArtists
    WHERE store = '${store}'
    AND id = '${id}'`);
}

function get(store) {
  return query(`
    SELECT id, gid, name, url, artwork
    FROM favoriteArtists
    WHERE store = '${store}'`);
}

module.exports = { add, edit, remove, get };
