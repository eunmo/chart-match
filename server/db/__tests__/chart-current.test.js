const { dml, cleanup } = require('@eunmo/mysql');
const { getTops } = require('../chart-current');
const {
  addMissingAlbums,
  getAlbumIds,
  addMissingSingles,
  getSingleIds,
} = require('../chart-entry');
const {
  addAlbums: addAlbumMatches,
  addSingles: addSingleMatches,
} = require('../chart-match');
const { addAlbums, addSingles } = require('../chart');

const week = '2020-09-12';
const dummyEntries = [
  { artist: 'a1', title: 't1' },
  { artist: 'a2', title: 't2' },
];

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartMatch;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartMatch;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');

  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
  await dml('CREATE TABLE singleChartMatch LIKE chart.singleChartMatch;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');
  await dml('CREATE TABLE albumChartMatch LIKE chart.albumChartMatch;');

  await addMissingSingles(0, dummyEntries);
  await addMissingSingles(1, dummyEntries);
  const singleIds = [];
  singleIds[0] = await getSingleIds(0, dummyEntries);
  singleIds[1] = await getSingleIds(1, dummyEntries);

  const songs = [
    [
      { entry: singleIds[0][0].id, track: 0, id: '1' },
      { entry: singleIds[0][0].id, track: 1, id: '2' },
      { entry: singleIds[0][1].id, track: 0, id: '3' },
    ],
    [
      { entry: singleIds[1][0].id, track: 0, id: '1' },
      { entry: singleIds[1][1].id, track: 0, id: '2' },
      { entry: singleIds[1][1].id, track: 1, id: '3' },
    ],
  ];

  await addSingles(0, week, singleIds[0]);
  await addSingles(1, week, singleIds[1]);
  await addSingleMatches('en', songs[0]);
  await addSingleMatches('en', songs[1]);

  await addMissingAlbums(0, dummyEntries);
  await addMissingAlbums(1, dummyEntries);
  const albumIds = [];
  albumIds[0] = await getAlbumIds(0, dummyEntries);
  albumIds[1] = await getAlbumIds(1, dummyEntries);

  const albums = [
    [
      { entry: albumIds[0][0].id, id: '1' },
      { entry: albumIds[0][1].id, id: '2' },
    ],
    [
      { entry: albumIds[1][0].id, id: '1' },
      { entry: albumIds[1][1].id, id: '3' },
    ],
  ];

  await addAlbums(0, week, albumIds[0]);
  await addAlbums(1, week, albumIds[1]);
  await addAlbumMatches('en', albums[0]);
  await addAlbumMatches('en', albums[1]);
});

afterAll(async () => {
  await dml('DROP TABLE singleChart;');
  await dml('DROP TABLE singleChartMatch;');
  await dml('DROP TABLE singleChartEntry;');
  await dml('DROP TABLE albumChart;');
  await dml('DROP TABLE albumChartMatch;');
  await dml('DROP TABLE albumChartEntry;');
  await cleanup();
});

test('get tops', async () => {
  const [songs, albums] = await getTops('en');
  expect(songs.length).toBe(2);
  songs.forEach(({ ranking, track, id }) => {
    expect(ranking).toBe(1);
    expect(track).toBe(0);
    expect(id).toEqual('1');
  });
  expect(albums.length).toBe(2);
  albums.forEach(({ ranking, id }) => {
    expect(ranking).toBe(1);
    expect(id).toEqual('1');
  });
});
