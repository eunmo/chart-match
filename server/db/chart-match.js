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

module.exports = { addSingles, addAlbums };
