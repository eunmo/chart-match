const { dml, query } = require('@eunmo/mysql');

function add(store, id, gid, name, url, artwork) {
  const values = [store, id, gid, name, url, artwork];
  return dml(
    `
    INSERT INTO favoriteArtist (store, id, gid, name, url, artwork)
    VALUES (?)`,
    [values]
  );
}

function edit(store, id, gid) {
  return dml(
    `
    UPDATE favoriteArtist
    SET gid = ?
    WHERE store = ?
    AND id = ?`,
    [gid, store, id]
  );
}

function remove(store, id) {
  return dml(
    `
    DELETE FROM favoriteArtist
    WHERE store = ?
    AND id = ?`,
    [store, id]
  );
}

function get(store) {
  return query(
    `
    SELECT id, gid, name, url, artwork
    FROM favoriteArtist
    WHERE store = ?`,
    [store]
  );
}

function addAlbums(store, artist, entries) {
  const values = entries.map(({ id }) => [store, id, artist]);
  return dml(
    `
    INSERT IGNORE INTO favoriteArtistAlbum (store, id, artist)
    VALUES ?`,
    [values]
  );
}

function editAlbums(store, includedMap) {
  const vals = Object.entries(includedMap)
    .map(([id, included]) => `SELECT '${id}' as id, ${included} as included`)
    .join(' UNION ');

  return dml(
    `
    UPDATE favoriteArtistAlbum, (${vals}) vals
    SET favoriteArtistAlbum.included = vals.included
    WHERE store = ?
    AND favoriteArtistAlbum.id = vals.id`,
    store
  );
}

async function getAlbums(store, artist) {
  const rows = await dml(
    `
    SELECT id, included
    FROM favoriteArtistAlbum
    WHERE store = ?
    AND artist = ?`,
    [store, artist]
  );
  return rows.map(({ id, included }) => ({ id, included: !!included }));
}

function clearSongs(store) {
  return dml(
    `
    DELETE FROM favoriteArtistSong
    WHERE store = ?`,
    store
  );
}

function addSongs(store, gid, entries) {
  const values = entries.map(({ id }) => [store, id, gid]);
  return dml(
    `
    INSERT IGNORE INTO favoriteArtistSong (store, id, gid)
    VALUES ?`,
    [values]
  );
}

function getSongs(store) {
  return query(
    `
    SELECT id, gid
    FROM favoriteArtistSong
    WHERE store = ?`,
    store
  );
}

function getSongCounts(store) {
  return query(
    `
    SELECT gid, count(*) as count
    FROM favoriteArtistSong
    WHERE store = ?
    GROUP BY gid`,
    store
  );
}

module.exports = {
  add,
  edit,
  remove,
  get,
  addAlbums,
  editAlbums,
  getAlbums,
  clearSongs,
  addSongs,
  getSongs,
  getSongCounts,
};
