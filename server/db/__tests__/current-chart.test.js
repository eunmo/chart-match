const { dml, cleanup } = require('@eunmo/mysql');
const { addMissingSingles, getSingleIds } = require('../chart-entry');
const { addSingles: addSingleMatches } = require('../chart-match');
const { addSingles, getCurrentSingles } = require('../chart');

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
let songs;

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartMatch;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
  await dml('CREATE TABLE singleChartMatch LIKE chart.singleChartMatch;');
  await addMissingSingles(chart, dummyEntries);
  ids = await getSingleIds(chart, dummyEntries);

  songs = [
    { entry: ids[0].id, track: 0, id: '1', url: 'https://1' },
    { entry: ids[1].id, track: 0, id: '2', url: 'https://2' },
    { entry: ids[1].id, track: 1, id: '3', url: 'https://3' },
    { entry: ids[2].id, track: 0 },
    { entry: ids[3].id, track: 0 },
  ];
});

afterAll(async () => {
  await dml('DROP TABLE singleChart;');
  await dml('DROP TABLE singleChartMatch;');
  await dml('DROP TABLE singleChartEntry;');
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE singleChartMatch;');
});

test('get latests singles', async () => {
  const prevWeek = '2020-09-05';
  await addSingles(chart, prevWeek, ids);
  await addSingles(chart, week, ids);
  await addSingles(0, week, ids);
  await addSingleMatches('en', songs);
  await addSingleMatches('jp', songs);

  const rows = await getCurrentSingles('jp');
  expect(rows.length).toBe(10);
});
