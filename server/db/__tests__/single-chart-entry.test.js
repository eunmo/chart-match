const { dml, cleanup } = require('@eunmo/mysql');
const { addMissing, getIds } = require('../single-chart-entry');

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
});

afterAll(async () => {
  await dml('DROP TABLE singleChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE singleChartEntry;');
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
  await addMissing(1, set1);
  const rows = await getIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);
});

test('insert two twice', async () => {
  await addMissing(1, set1);
  let rows = await getIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);

  await addMissing(1, set1);
  rows = await getIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);
});

test('insert two then two with overlap', async () => {
  await addMissing(1, set1);
  let rows = await getIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);

  await addMissing(1, set2);
  rows = await getIds(1, set2);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(3);
});

test('insert two then two without overlap', async () => {
  await addMissing(1, set1);
  let rows = await getIds(1, set1);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(1);
  expect(rows[1].id).toBe(2);

  await addMissing(1, set3);
  rows = await getIds(1, set3);
  expect(rows.length).toBe(2);
  expect(rows[0].id).toBe(3);
  expect(rows[1].id).toBe(4);
});
