const { dml, cleanup } = require('@eunmo/mysql');
const { getSortedAlbums } = require('../chart-current');
const { addMissingAlbums, getAlbumIds } = require('../chart-entry');
const { addAlbums: addAlbumMatches } = require('../chart-match');
const { addAlbums } = require('../chart');

const week = '2020-09-12';
const dummyEntries = [
  { artist: 'a1', title: 't1' },
  { artist: 'a2', title: 't2' },
  { artist: 'a3', title: 't3' },
  { artist: 'a4', title: 't4' },
  { artist: 'a5', title: 't5' },
  { artist: 'a6', title: 't6' },
  { artist: 'a7', title: 't7' },
];
let ids;
let albums;

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartMatch;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');
  await dml('CREATE TABLE albumChartMatch LIKE chart.albumChartMatch;');
  await addMissingAlbums(0, dummyEntries);
  await addMissingAlbums(1, dummyEntries);
  ids = [];
  ids[0] = await getAlbumIds(0, dummyEntries);
  ids[1] = await getAlbumIds(1, dummyEntries);

  albums = [
    [
      { entry: ids[0][0].id, id: '1' },
      { entry: ids[0][1].id, id: '2' },
      { entry: ids[0][2].id, id: '3' },
      { entry: ids[0][3].id },
      { entry: ids[0][4].id, id: '4' },
      { entry: ids[0][5].id, id: '5' },
      { entry: ids[0][6].id, id: '6' },
    ],
    [
      { entry: ids[1][0].id, id: '1' },
      { entry: ids[1][1].id, id: '3' },
      { entry: ids[1][2].id, id: '2' },
      { entry: ids[1][3].id },
      { entry: ids[1][4].id, id: '5' },
      { entry: ids[1][5].id, id: '4' },
      { entry: ids[1][6].id, id: '7' },
    ],
    [
      { entry: ids[1][0].id, id: '1' },
      { entry: ids[1][1].id, id: '3' },
      { entry: ids[1][2].id, id: '2' },
      { entry: ids[1][3].id },
      { entry: ids[1][4].id, id: '5' },
      { entry: ids[1][5].id, id: '4' },
    ],
  ];
});

afterAll(async () => {
  await dml('DROP TABLE albumChart;');
  await dml('DROP TABLE albumChartMatch;');
  await dml('DROP TABLE albumChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE albumChartMatch;');
});

test('get latests albums', async () => {
  const prevWeek = '2020-09-05';
  await addAlbums(0, week, ids[0]);
  await addAlbums(1, prevWeek, ids[1]);
  await addAlbums(1, week, ids[1]);
  await addAlbumMatches('en', albums[0]);
  await addAlbumMatches('en', albums[1]);
  await addAlbumMatches('jp', albums[0]);
  await addAlbumMatches('jp', albums[2]);

  let rows = await getSortedAlbums('en');
  expect(rows.length).toBe(7);
  let expected = '1234567'.split('');
  expected.forEach((id, index) => {
    expect(rows[index].id).toEqual(id);
  });
  rows = await getSortedAlbums('jp');
  expect(rows.length).toBe(6);
  expected = '123456'.split('');
  expected.forEach((id, index) => {
    expect(rows[index].id).toEqual(id);
  });
});
