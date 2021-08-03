const { dml, cleanup } = require('@eunmo/mysql');
const { addMissing, getIds } = require('../chart-entry');
const { add: addMatches } = require('../chart-match');
const { add, getYear1, getYear10 } = require('../chart');

const dummyEntries = [...Array(25).keys()].map((i) => ({
  artist: `a${i}`,
  title: `t${i}`,
}));
let ids;
let entries;

const week1 = '2019-09-14';
const week2 = '2020-09-05';
const week3 = '2020-09-12';
const week4 = '2020-09-19';
const week5 = '2020-09-26';

afterAll(async () => {
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  beforeAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
    await addMissing(type, 0, dummyEntries);
    ids = await getIds(type, 0, dummyEntries);

    entries = [...Array(5).keys()]
      .map((i) => [
        { entry: ids[i * 5 + 0].id, idx: 0, id: `${i}1` },
        { entry: ids[i * 5 + 1].id, idx: 0, id: `${i}2` },
        { entry: ids[i * 5 + 1].id, idx: 1, id: `${i}3` },
        { entry: ids[i * 5 + 2].id, idx: 0 },
        { entry: ids[i * 5 + 3].id, idx: 0 },
        { entry: ids[i * 5 + 4].id, idx: 0 },
      ])
      .flat();
  });

  afterAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  beforeEach(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
  });

  test('get 1s', async () => {
    await add(type, 0, week1, ids.slice(0, 20));
    await add(type, 0, week2, ids.slice(5, 20));
    await add(type, 0, week3, ids.slice(10, 20));
    await add(type, 0, week4, ids.slice(20, 25));
    await add(type, 0, week5, ids.slice(20, 25));
    await addMatches(type, 'en', entries);

    const rows = await getYear1(type, 0, '2020', 'en');
    expect(rows.length).toBe(4);
  });

  test('get 10s', async () => {
    await add(type, 0, week1, ids.slice(0, 20));
    await add(type, 0, week2, ids.slice(5, 20));
    await add(type, 0, week3, ids.slice(10, 20));
    await add(type, 0, week4, ids.slice(20, 25));
    await addMatches(type, 'en', entries);

    const rows = await getYear10(type, 0, '2020', 'en');
    expect(rows.length).toBe(18);
  });
});
