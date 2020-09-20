const { dml, cleanup } = require('@eunmo/mysql');
const { addMissingAlbums, getAlbumIds } = require('../chart-entry');

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS albumChartEntry;');
  await dml('CREATE TABLE albumChartEntry LIKE chart.albumChartEntry;');
});

afterAll(async () => {
  await dml('DROP TABLE albumChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE albumChartEntry;');
});

const set1 = [
  { artist: 'a1', title: 't1' },
  { artist: 'a2', title: 't2' },
];

const set2 = [
  { artist: 'a1', title: 't1' },
  { artist: 'a3', title: 't3' },
];

const set3 = [
  { artist: 'a3', title: 't3' },
  { artist: 'a4', title: 't4' },
];

test('insert two', async () => {
  await addMissingAlbums(1, set1);
  const rows = await getAlbumIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);
});

test('insert two twice', async () => {
  await addMissingAlbums(1, set1);
  let rows = await getAlbumIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);

  await addMissingAlbums(1, set1);
  rows = await getAlbumIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);
});

test('insert two then two with overlap', async () => {
  await addMissingAlbums(1, set1);
  let rows = await getAlbumIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);

  await addMissingAlbums(1, set2);
  rows = await getAlbumIds(1, set2);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(3);
});

test('insert two then two without overlap', async () => {
  await addMissingAlbums(1, set1);
  let rows = await getAlbumIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);

  await addMissingAlbums(1, set3);
  rows = await getAlbumIds(1, set3);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(3);
  expect(rows[1].id).toBe(4);
});
