const { dml, query, cleanup } = require('@eunmo/mysql');
const { addMissing, getIds } = require('../chart-entry');
const { add, getRaw, getLatestWeeks, getFirstWeeks } = require('../chart');

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

afterAll(async () => {
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  beforeAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
    await addMissing(type, chart, dummyEntries);
    ids = await getIds(type, chart, dummyEntries);
  });

  afterAll(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  beforeEach(async () => {
    await dml(`TRUNCATE TABLE ${type}Chart`);
  });

  test('add', async () => {
    await add(type, chart, week, ids);
    const rows = await query(`SELECT * FROM ${type}Chart`);
    expect(rows.length).toBe(5);
  });

  test('add then get', async () => {
    await add(type, chart, week, ids);
    const rows = await getRaw(type, chart, week);
    dummyEntries.forEach(({ artist, title }, index) => {
      const row = rows[index];
      expect(row.ranking).toBe(index + 1);
      expect(row.artist).toEqual(artist);
      expect(row.title).toEqual(title);
    });
  });

  test('get latest weeks', async () => {
    const prevWeek = '2020-09-05';
    await add(type, 0, prevWeek, ids);
    await add(type, chart, week, ids);
    const rows = await getLatestWeeks(type);
    expect(rows.length).toBe(2);
    expect(rows[0].week.toISOString().substring(0, 10)).toBe(prevWeek);
    expect(rows[0].chart).toBe(0);
    expect(rows[1].week.toISOString().substring(0, 10)).toBe(week);
    expect(rows[1].chart).toBe(chart);
  });

  test('get first weeks', async () => {
    const prevWeek = '2020-09-05';
    await add(type, chart, prevWeek, [ids[0], ids[1], ids[2]]);
    await add(type, chart, week, [ids[2], ids[3], ids[4]]);
    const rows = await getFirstWeeks(
      type,
      ids.map(({ id }) => id)
    );
    expect(rows.length).toBe(5);
    const expected = {
      [ids[0].id]: prevWeek,
      [ids[1].id]: prevWeek,
      [ids[2].id]: prevWeek,
      [ids[3].id]: week,
      [ids[4].id]: week,
    };

    rows.forEach(({ entry, week: wk }) => {
      expect(wk.toISOString().substring(0, 10)).toBe(expected[entry]);
    });
  });
});
