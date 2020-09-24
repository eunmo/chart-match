const { dml } = require('@eunmo/mysql');

function format(string) {
  return string === undefined || string === null ? null : `'${string}'`;
}

function addSingles(store, songs) {
  const values = songs.map(
    ({ entry, track, id, url }) =>
      `(${entry}, '${store}', ${track}, ${format(id)}, ${format(url)})`
  );

  return dml(`
    INSERT INTO singleChartMatch
    VALUES ${values.join(',')}`);
}

function addAlbums(store, albums) {
  const values = albums.map(
    ({ entry, id, url }) =>
      `(${entry}, '${store}', ${format(id)}, ${format(url)})`
  );

  return dml(`
    INSERT INTO albumChartMatch
    VALUES ${values.join(',')}`);
}

module.exports = { addSingles, addAlbums };
