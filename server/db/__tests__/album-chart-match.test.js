const { dml, query, cleanup } = require('@eunmo/mysql');
const { addMissingAlbums, getAlbumIds } = require('../chart-entry');
const { addAlbums: addAlbumMatches } = require('../chart-match');
const { addAlbums, getAlbumMatches, getAlbumNonMatches } = require('../chart');

const chart = 1;
const week = '2020-09-12';
const dummyEntries = [
  { artist: 'a1', title: 't1' },
  { artist: 'a2', title: 't2' },
  { artist: 'a3', title: 't3' },
  { artist: 'a4', title: 't4' },
  { artist: 'a5', title: 't5' },
];
let ids;
let albums1;
let albums2;

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartMatch;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');
  await dml('CREATE TABLE albumChartMatch LIKE chart.albumChartMatch;');
  await addMissingAlbums(chart, dummyEntries);
  ids = await getAlbumIds(chart, dummyEntries);
  await addAlbums(chart, week, ids);

  albums1 = [
    { entry: ids[0].id, id: '1' },
    { entry: ids[1].id, id: '2' },
    { entry: ids[2].id, id: '3' },
    { entry: ids[3].id },
    { entry: ids[4].id },
  ];

  albums2 = [
    { entry: ids[0].id, id: '1' },
    { entry: ids[1].id, id: '2' },
    { entry: ids[2].id, id: '3' },
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

test('add', async () => {
  await addAlbumMatches('en', albums1);
  const rows = await query('SELECT * FROM albumChartMatch');
  expect(rows.length).toBe(5);
});

test.each([true, false])('add then get', async (withUndefined) => {
  const albums = withUndefined ? albums1 : albums2;
  await addAlbumMatches('en', albums);
  const rows = await getAlbumMatches(chart, week, 'en');
  expect(rows.length).toEqual(withUndefined ? 5 : 3);
  expect(rows[0].id).toEqual('1');
  expect(rows[1].id).toEqual('2');
  expect(rows[2].id).toEqual('3');
  if (withUndefined) {
    expect(rows[3].id).toBe(null);
    expect(rows[4].id).toBe(null);
  }

  const nonMatches = await getAlbumNonMatches(chart, week, 'en');
  expect(nonMatches.length).toEqual(withUndefined ? 0 : 2);
});
