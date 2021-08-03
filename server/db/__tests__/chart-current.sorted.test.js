const { dml, cleanup } = require('@eunmo/mysql');
const { getSorted } = require('../chart-current');
const { addMissing, getIds } = require('../chart-entry');
const { add: addMatches } = require('../chart-match');
const { add, getWeek, getWeeks } = require('../chart');

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
let entries;

afterAll(async () => {
  await Promise.all(
    ['single', 'album'].map(async (type) => {
      await dml(`TRUNCATE TABLE ${type}Chart`);
      await dml(`TRUNCATE TABLE ${type}ChartMatch`);
      await dml(`TRUNCATE TABLE ${type}ChartEntry`);
    })
  );
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  beforeAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
    await addMissing(type, 0, dummyEntries);
    await addMissing(type, 1, dummyEntries);
    ids = [];
    ids[0] = await getIds(type, 0, dummyEntries);
    ids[1] = await getIds(type, 1, dummyEntries);

    entries = [
      [
        { entry: ids[0][0].id, idx: 0, id: '1' },
        { entry: ids[0][1].id, idx: 0, id: '2' },
        { entry: ids[0][1].id, idx: 1, id: '3' },
        { entry: ids[0][2].id, idx: 0 },
        { entry: ids[0][3].id, idx: 0 },
        { entry: ids[0][4].id, idx: 0, id: '4' },
        { entry: ids[0][5].id, idx: 0, id: '5' },
        { entry: ids[0][6].id, idx: 0, id: '6' },
      ],
      [
        { entry: ids[1][0].id, idx: 0, id: '1' },
        { entry: ids[1][1].id, idx: 0, id: '2' },
        { entry: ids[1][1].id, idx: 1, id: '3' },
        { entry: ids[1][2].id, idx: 0 },
        { entry: ids[1][3].id, idx: 0 },
        { entry: ids[1][4].id, idx: 0, id: '5' },
        { entry: ids[1][5].id, idx: 0, id: '4' },
        { entry: ids[1][6].id, idx: 0, id: '7' },
      ],
      [
        { entry: ids[1][0].id, idx: 0, id: '1' },
        { entry: ids[1][1].id, idx: 0, id: '2' },
        { entry: ids[1][1].id, idx: 1, id: '3' },
        { entry: ids[1][2].id, idx: 0 },
        { entry: ids[1][3].id, idx: 0 },
        { entry: ids[1][4].id, idx: 0, id: '5' },
        { entry: ids[1][5].id, idx: 0, id: '4' },
      ],
    ];
  });

  afterAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  beforeEach(async () => {
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
  });

  test('get sorted', async () => {
    const prevWeek = '2020-09-05';
    await add(type, 0, week, ids[0]);
    await add(type, 1, prevWeek, ids[1]);
    await add(type, 1, week, ids[1]);
    await addMatches(type, 'en', entries[0]);
    await addMatches(type, 'en', entries[1]);
    await addMatches(type, 'jp', entries[0]);
    await addMatches(type, 'jp', entries[2]);

    let rows = await getSorted(type, 'en');
    expect(rows.length).toBe(7);
    let expected = '1234567'.split('');
    expected.forEach((id, index) => {
      expect(rows[index].id).toEqual(id);
    });

    rows = await getSorted(type, 'jp');
    expect(rows.length).toBe(6);
    expected = '123456'.split('');
    expected.forEach((id, index) => {
      expect(rows[index].id).toEqual(id);
    });

    rows = await getWeek(type, 0, week, 'en');
    expect(rows.length).toBe(8);

    rows = await getWeek(type, 0, week, 'jp');
    expect(rows.length).toBe(8);

    rows = await getWeeks(type, 'en', [week, prevWeek]);
    expect(rows.length).toBe(7);

    rows = await getWeeks(type, 'jp', [week, prevWeek]);
    expect(rows.length).toBe(6);
  });
});
