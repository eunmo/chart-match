const { dml, query } = require('@eunmo/mysql');
const { escape, format } = require('./util');

function add(store, id, gid, name, url, artwork) {
  const values = [store, id, gid, escape(name), url].map(format);
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

function clearAlbums(store, artist) {
  return dml(`
    DELETE FROM favoriteArtistAlbum
    WHERE store = '${store}'
    AND artist = '${artist}'`);
}

function addAlbums(store, artist, entries) {
  const values = entries.map(({ id }) => `('${store}', '${id}', '${artist}')`);
  return dml(`
    INSERT IGNORE INTO favoriteArtistAlbum (store, id, artist)
    VALUES ${values.join(',')}`);
}

function editAlbums(store, includedMap) {
  const vals = Object.entries(includedMap)
    .map(([id, included]) => `SELECT '${id}' as id, ${included} as included`)
    .join(' UNION ');

  return dml(`
    UPDATE favoriteArtistAlbum, (${vals}) vals
    SET favoriteArtistAlbum.included = vals.included
    WHERE store = '${store}'
    AND favoriteArtistAlbum.id = vals.id`);
}

async function getAlbums(store, artist) {
  const rows = await dml(`
    SELECT id, included
    FROM favoriteArtistAlbum
    WHERE store = '${store}'
    AND artist = '${artist}'`);
  return rows.map(({ id, included }) => ({ id, included: !!included }));
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
  clearAlbums,
  addAlbums,
  editAlbums,
  getAlbums,
  clearSongs,
  addSongs,
  getSongs,
  getSongCounts,
};
