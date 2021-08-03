const { dml, query, cleanup } = require('@eunmo/mysql');
const { addMissing, getIds, getFull } = require('../chart-entry');
const { add: addMatches, remove } = require('../chart-match');
const { add, getMatches, getNonMatches } = require('../chart');

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
let entries1;
let entries2;

afterAll(async () => {
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  beforeAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartMatch`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
    await addMissing(type, chart, dummyEntries);
    ids = await getIds(type, chart, dummyEntries);
    await add(type, chart, week, ids);

    entries1 = [
      { entry: ids[0].id, idx: 0, id: '1' },
      { entry: ids[1].id, idx: 0, id: '2' },
      { entry: ids[1].id, idx: 1, id: '3' },
      { entry: ids[2].id, idx: 0 },
      { entry: ids[3].id, idx: 0 },
    ];

    entries2 = [
      { entry: ids[0].id, idx: 0, id: '1' },
      { entry: ids[1].id, idx: 0, id: '2' },
      { entry: ids[1].id, idx: 1, id: '3' },
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

  test('add', async () => {
    await addMatches(type, 'en', entries1);
    const rows = await query(`SELECT * FROM ${type}ChartMatch`);
    expect(rows.length).toBe(5);
  });

  test.each([true, false])('add then get', async (withUndefined) => {
    const entries = withUndefined ? entries1 : entries2;
    await addMatches(type, 'en', entries);
    const rows = await getMatches(type, chart, week, 'en');
    expect(rows.length).toEqual(withUndefined ? 5 : 3);
    expect(rows[0].id).toEqual('1');
    expect(rows[1].id).toEqual('2');
    expect(rows[2].id).toEqual('3');
    if (withUndefined) {
      expect(rows[3].id).toBe(null);
      expect(rows[4].id).toBe(null);
    }

    const nonMatches = await getNonMatches(type, chart, week, 'en');
    expect(nonMatches.length).toEqual(withUndefined ? 1 : 3);
  });

  test.each([
    [0, 1, 4],
    [1, 2, 3],
  ])('delete %d', async (index, rank, count) => {
    await addMatches(type, 'en', entries1);
    const { id } = ids[index];
    await remove(type, 'en', id);

    let rows = await getMatches(type, chart, week, 'en');
    expect(rows.length).toBe(count);
    rows.forEach(({ ranking }) => {
      expect(ranking).not.toBe(rank);
    });

    rows = await getFull(type, chart, id, 'en');
    expect(rows.length).toBe(1);
    expect(rows[0].id).toBe(null);
  });

  test('update one', async () => {
    await addMatches(type, 'en', entries1);
    const { id } = ids[0];
    await remove(type, 'en', id);
    await addMatches(type, 'en', [{ entry: id, idx: 0, id: '6' }]);

    let rows = await getMatches(type, chart, week, 'en');
    expect(rows[0].id).toBe('6');
    rows = await getFull(type, chart, id, 'en');
    expect(rows.length).toBe(1);
    expect(rows[0].id).toBe('6');
  });

  test('update two', async () => {
    await addMatches(type, 'en', entries1);
    const { id } = ids[0];
    await remove(type, 'en', id);
    await addMatches(type, 'en', [{ entry: id, idx: 0, id: '6' }]);
    await addMatches(type, 'en', [{ entry: id, idx: 1, id: '7' }]);

    let rows = await getMatches(type, chart, week, 'en');
    expect(rows[0].id).toBe('6');
    expect(rows[1].id).toBe('7');

    rows = await getFull(type, chart, id, 'en');
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe('6');
    expect(rows[1].id).toBe('7');
  });

  test('update two together', async () => {
    await addMatches(type, 'en', entries1);
    const { id } = ids[0];
    await remove(type, 'en', id);
    await addMatches(type, 'en', [
      { entry: id, idx: 0, id: '6' },
      { entry: id, idx: 1, id: '7' },
    ]);

    let rows = await getMatches(type, chart, week, 'en');
    expect(rows[0].id).toBe('6');
    expect(rows[1].id).toBe('7');

    rows = await getFull(type, chart, id, 'en');
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe('6');
    expect(rows[1].id).toBe('7');
  });
});
