const { dml, query } = require('@eunmo/mysql');
const { format } = require('./util');

function add(store, id, gid, name, url, artwork) {
  const values = [store, id, gid, name, url].map(format);
  return dml(`
    INSERT INTO favoriteArtist (store, id, gid, name, url, artwork)
    VALUES (${values.join(',')}, ${format(artwork)})`);
}

function edit(store, id, gid) {
  return dml(`
    UPDATE favoriteArtist
    SET gid = ${format(gid)}
    WHERE store = ${format(store)}
    AND id = ${format(id)}`);
}

function remove(store, id) {
  return dml(`
    DELETE FROM favoriteArtist
    WHERE store = '${store}'
    AND id = '${id}'`);
}

function get(store) {
  return query(`
    SELECT id, gid, name, url, artwork
    FROM favoriteArtist
    WHERE store = '${store}'`);
}

function clearSongs(store) {
  return dml(`
    DELETE FROM favoriteArtistSong
    WHERE store = '${store}'`);
}

function addSongs(store, gid, entries) {
  const values = entries.map(
    ({ id }) => `(${format(store)}, ${format(id)}, ${format(gid)})`
  );
  return dml(`
    INSERT IGNORE INTO favoriteArtistSong (store, id, gid)
    VALUES ${values.join(',')}`);
}

function getSongs(store) {
  return query(`
    SELECT id, gid
    FROM favoriteArtistSong
    WHERE store = '${store}'`);
}

function getSongCounts(store) {
  return query(`
    SELECT gid, count(*) as count
    FROM favoriteArtistSong
    WHERE store = '${store}'
    GROUP BY gid`);
}

module.exports = {
  add,
  edit,
  remove,
  get,
  clearSongs,
  addSongs,
  getSongs,
  getSongCounts,
};
