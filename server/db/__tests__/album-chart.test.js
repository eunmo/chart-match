const { dml, query, cleanup } = require('@eunmo/mysql');
const { addMissingAlbums, getAlbumIds } = require('../chart-entry');
const { addAlbums, getRawAlbums, getLatestAlbumWeeks } = require('../chart');

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

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS albumChart;');
  await dml('DROP TABLE IF EXISTS albumChartEntry;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
  await dml('CREATE TABLE albumChart LIKE chart.albumChart;');
  await addMissingAlbums(chart, dummyEntries);
  ids = await getAlbumIds(chart, dummyEntries);
});

afterAll(async () => {
  await dml('DROP TABLE albumChart;');
  await dml('DROP TABLE albumChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE albumChart;');
});

test('add', async () => {
  await addAlbums(chart, week, ids);
  const rows = await query('SELECT * FROM albumChart');
  expect(rows.length).toBe(5);
});

test('add then get', async () => {
  await addAlbums(chart, week, ids);
  const rows = await getRawAlbums(chart, week);
  dummyEntries.forEach(({ artist, title }, index) => {
    const row = rows[index];
    expect(row.ranking).toBe(index + 1);
    expect(row.artist).toEqual(artist);
    expect(row.title).toEqual(title);
  });
});

test('get latest weeks', async () => {
  const prevWeek = '2020-09-05';
  await addAlbums(0, prevWeek, ids);
  await addAlbums(chart, week, ids);
  const rows = await getLatestAlbumWeeks();
  expect(rows.length).toBe(2);
  expect(rows[0].week.toISOString().substring(0, 10)).toBe(prevWeek);
  expect(rows[0].chart).toBe(0);
  expect(rows[1].week.toISOString().substring(0, 10)).toBe(week);
  expect(rows[1].chart).toBe(chart);
});
