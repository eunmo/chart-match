const { dml, query, cleanup } = require('@eunmo/mysql');
const { addMissingSingles, getSingleIds } = require('../chart-entry');
const { addSingles: addSingleMatches } = require('../chart-match');
const {
  addSingles,
  getSingleMatches,
  getSingleNonMatches,
} = require('../chart');

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
let songs1;
let songs2;

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartMatch;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
  await dml('CREATE TABLE singleChartMatch LIKE chart.singleChartMatch;');
  await addMissingSingles(chart, dummyEntries);
  ids = await getSingleIds(chart, dummyEntries);
  await addSingles(chart, week, ids);

  songs1 = [
    { entry: ids[0].id, track: 0, id: '1', url: 'https://1' },
    { entry: ids[1].id, track: 0, id: '2', url: 'https://2' },
    { entry: ids[1].id, track: 1, id: '3', url: 'https://3' },
    { entry: ids[2].id, track: 0 },
    { entry: ids[3].id, track: 0 },
  ];

  songs2 = [
    { entry: ids[0].id, track: 0, id: '1', url: 'https://1' },
    { entry: ids[1].id, track: 0, id: '2', url: 'https://2' },
    { entry: ids[1].id, track: 1, id: '3', url: 'https://3' },
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

test('add', async () => {
  await addSingleMatches('en', songs1);
  const rows = await query('SELECT * FROM singleChartMatch');
  expect(rows.length).toBe(5);
});

test.each([true, false])('add then get', async (withUndefined) => {
  const songs = withUndefined ? songs1 : songs2;
  await addSingleMatches('en', songs);
  const rows = await getSingleMatches(chart, week, 'en');
  expect(rows.length).toEqual(withUndefined ? 5 : 3);
  expect(rows[0].id).toEqual('1');
  expect(rows[1].id).toEqual('2');
  expect(rows[2].id).toEqual('3');
  expect(rows[0].url).toEqual('https://1');
  expect(rows[1].url).toEqual('https://2');
  expect(rows[2].url).toEqual('https://3');
  if (withUndefined) {
    expect(rows[3].id).toBe(null);
    expect(rows[4].id).toBe(null);
    expect(rows[3].url).toBe(null);
    expect(rows[4].url).toBe(null);
  }

  const nonMatches = await getSingleNonMatches(chart, week, 'en');
  expect(nonMatches.length).toEqual(withUndefined ? 1 : 3);
});
