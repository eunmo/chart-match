const { dml, query, cleanup } = require('@eunmo/mysql');
const { addMissing, getIds } = require('../album-chart-entry');
const { add } = require('../album-chart');

const chart = 1;
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
  await addMissing(chart, dummyEntries);
  ids = await getIds(chart, dummyEntries);
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
  await add(1, '2020-09-12', ids);
  const rows = await query('SELECT * FROM albumChart');
  expect(rows.length).toBe(5);
});
