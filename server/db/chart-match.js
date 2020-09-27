const { dml } = require('@eunmo/mysql');

function format(string) {
  return string === undefined || string === null ? null : `'${string}'`;
}

function addSingles(store, songs) {
  const values = songs.map(
    ({ entry, track, id }) => `(${entry}, '${store}', ${track}, ${format(id)})`
  );

  return dml(`
    INSERT INTO singleChartMatch
    VALUES ${values.join(',')}`);
}

function addAlbums(store, albums) {
  const values = albums.map(
    ({ entry, id }) => `(${entry}, '${store}', ${format(id)})`
  );

  return dml(`
    INSERT INTO albumChartMatch
    VALUES ${values.join(',')}`);
}

function deleteSingle(store, entry) {
  return dml(`
    DELETE FROM singleChartMatch
    WHERE store='${store}'
    AND entry=${entry}`);
}

function editAlbum(store, entry, id) {
  return dml(`
    UPDATE albumChartMatch
    SET id=${id}
    WHERE store='${store}'
    AND entry=${entry}`);
}

function clearSingle(store, entry) {
  return dml(`
    UPDATE singleChartMatch
    SET id=null
    WHERE store='${store}'
    AND entry=${entry}`);
}

function clearAlbum(store, entry) {
  return dml(`
    UPDATE albumChartMatch
    SET id=null
    WHERE store='${store}'
    AND entry=${entry}`);
}

module.exports = {
  addSingles,
  addAlbums,
  deleteSingle,
  editAlbum,
  clearSingle,
  clearAlbum,
};
