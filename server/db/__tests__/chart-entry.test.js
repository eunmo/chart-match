const { dml, cleanup } = require('@eunmo/mysql');
const { addMissing, getIds } = require('../chart-entry');

const set1 = [
  { artist: 'a1', title: 't1' },
  { artist: 'a2', title: 't2' },
];

const set2 = [
  { artist: 'a1', title: 't1' },
  { artist: 'a3', title: 't3' },
];

const set3 = [
  { artist: 'a3', title: 't3' },
  { artist: 'a4', title: 't4' },
];

const set4 = [
  { artist: "a'", title: "t'" },
  { artist: "a'1", title: "t'1" },
  { artist: "a'2", title: "t'2" },
];

afterAll(async () => {
  await cleanup();
});

describe.each(['single', 'album'])('%s', (type) => {
  afterAll(async () => {
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  beforeEach(async () => {
    await dml(`TRUNCATE TABLE ${type}ChartEntry`);
  });

  test('insert two', async () => {
    await addMissing(type, 1, set1);
    const rows = await getIds(type, 1, set1);
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe(1);
    expect(rows[1].id).toBe(2);
  });

  test('insert two twice', async () => {
    await addMissing(type, 1, set1);
    let rows = await getIds(type, 1, set1);
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe(1);
    expect(rows[1].id).toBe(2);

    await addMissing(type, 1, set1);
    rows = await getIds(type, 1, set1);
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe(1);
    expect(rows[1].id).toBe(2);
  });

  test('insert two then two with overlap', async () => {
    await addMissing(type, 1, set1);
    let rows = await getIds(type, 1, set1);
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe(1);
    expect(rows[1].id).toBe(2);

    await addMissing(type, 1, set2);
    rows = await getIds(type, 1, set2);
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe(1);
    expect(rows[1].id).toBe(3);
  });

  test('insert two then two without overlap', async () => {
    await addMissing(type, 1, set1);
    let rows = await getIds(type, 1, set1);
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe(1);
    expect(rows[1].id).toBe(2);

    await addMissing(type, 1, set3);
    rows = await getIds(type, 1, set3);
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe(3);
    expect(rows[1].id).toBe(4);
  });

  test('escape', async () => {
    await addMissing(type, 1, set4);
    const rows = await getIds(type, 1, set4);
    expect(rows.length).toBe(3);
    expect(rows[0].id).toBe(1);
    expect(rows[1].id).toBe(2);
    expect(rows[2].id).toBe(3);
  });
});
