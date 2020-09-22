const { dml, query, cleanup } = require('@eunmo/mysql');
const { addMissingSingles, getSingleIds } = require('../chart-entry');
const { addSingles, getRawSingles, getLatestSingleWeeks } = require('../chart');

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
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
  await addMissingSingles(chart, dummyEntries);
  ids = await getSingleIds(chart, dummyEntries);
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
  await addSingles(chart, week, ids);
  const rows = await query('SELECT * FROM singleChart');
  expect(rows.length).toBe(5);
});

test('add then get', async () => {
  await addSingles(chart, week, ids);
  const rows = await getRawSingles(chart, week);
  dummyEntries.forEach(({ artist, title }, index) => {
    const row = rows[index];
    expect(row.ranking).toBe(index + 1);
    expect(row.artist).toEqual(artist);
    expect(row.title).toEqual(title);
  });
});

test('get latest weeks', async () => {
  const prevWeek = '2020-09-05';
  await addSingles(0, prevWeek, ids);
  await addSingles(chart, week, ids);
  const rows = await getLatestSingleWeeks();
  expect(rows.length).toBe(2);
  expect(rows[0].week.toISOString().substring(0, 10)).toBe(prevWeek);
  expect(rows[0].chart).toBe(0);
  expect(rows[1].week.toISOString().substring(0, 10)).toBe(week);
  expect(rows[1].chart).toBe(chart);
});
