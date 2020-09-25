const { dml, cleanup } = require('@eunmo/mysql');
const { getSortedSongs } = require('../chart-current');
const { addMissingSingles, getSingleIds } = require('../chart-entry');
const { addSingles: addSingleMatches } = require('../chart-match');
const { addSingles } = require('../chart');

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
let songs;

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS singleChart;');
  await dml('DROP TABLE IF EXISTS singleChartMatch;');
  await dml('DROP TABLE IF EXISTS singleChartEntry;');
  await dml('CREATE TABLE singleChartEntry LIKE chart.singleChartEntry;');
  await dml('CREATE TABLE singleChart LIKE chart.singleChart;');
  await dml('CREATE TABLE singleChartMatch LIKE chart.singleChartMatch;');
  await addMissingSingles(0, dummyEntries);
  await addMissingSingles(1, dummyEntries);
  ids = [];
  ids[0] = await getSingleIds(0, dummyEntries);
  ids[1] = await getSingleIds(1, dummyEntries);

  songs = [
    [
      { entry: ids[0][0].id, track: 0, id: '1' },
      { entry: ids[0][1].id, track: 0, id: '2' },
      { entry: ids[0][1].id, track: 1, id: '3' },
      { entry: ids[0][2].id, track: 0 },
      { entry: ids[0][3].id, track: 0 },
      { entry: ids[0][4].id, track: 0, id: '4' },
      { entry: ids[0][5].id, track: 0, id: '5' },
      { entry: ids[0][6].id, track: 0, id: '6' },
    ],
    [
      { entry: ids[1][0].id, track: 0, id: '1' },
      { entry: ids[1][1].id, track: 0, id: '2' },
      { entry: ids[1][1].id, track: 1, id: '3' },
      { entry: ids[1][2].id, track: 0 },
      { entry: ids[1][3].id, track: 0 },
      { entry: ids[1][4].id, track: 0, id: '5' },
      { entry: ids[1][5].id, track: 0, id: '4' },
      { entry: ids[1][6].id, track: 0, id: '7' },
    ],
    [
      { entry: ids[1][0].id, track: 0, id: '1' },
      { entry: ids[1][1].id, track: 0, id: '2' },
      { entry: ids[1][1].id, track: 1, id: '3' },
      { entry: ids[1][2].id, track: 0 },
      { entry: ids[1][3].id, track: 0 },
      { entry: ids[1][4].id, track: 0, id: '5' },
      { entry: ids[1][5].id, track: 0, id: '4' },
    ],
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
  await addSingles(0, week, ids[0]);
  await addSingles(1, prevWeek, ids[1]);
  await addSingles(1, week, ids[1]);
  await addSingleMatches('en', songs[0]);
  await addSingleMatches('en', songs[1]);
  await addSingleMatches('jp', songs[0]);
  await addSingleMatches('jp', songs[2]);

  let rows = await getSortedSongs('en');
  expect(rows.length).toBe(7);
  let expected = '1234567'.split('');
  expected.forEach((id, index) => {
    expect(rows[index].id).toEqual(id);
  });
  rows = await getSortedSongs('jp');
  expect(rows.length).toBe(6);
  expected = '123456'.split('');
  expected.forEach((id, index) => {
    expect(rows[index].id).toEqual(id);
  });
});
