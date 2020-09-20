const { dml, query, cleanup } = require('@eunmo/mysql');
const { addMissing, getIds } = require('../single-chart-entry');
const { add } = require('../single-chart');

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
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
  await addMissing(chart, dummyEntries);
  ids = await getIds(chart, dummyEntries);
});

afterAll(async () => {
  await dml('DROP TABLE singleChart;');
  await dml('DROP TABLE singleChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE singleChart;');
});

test('add', async () => {
  await add(1, '2020-09-12', ids);
  const rows = await query('SELECT * FROM singleChart');
  expect(rows.length).toBe(5);
});
