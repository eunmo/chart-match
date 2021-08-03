const { dml, cleanup } = require('@eunmo/mysql');
const { getTops } = require('../chart-current');
const { addMissing, getIds } = require('../chart-entry');
const { add: addMatches } = require('../chart-match');
const { add } = require('../chart');

const week = '2020-09-12';
const dummyEntries = [
  { artist: 'a1', title: 't1' },
  { artist: 'a2', title: 't2' },
];

beforeAll(async () => {
  await Promise.all(
    ['single', 'album'].map(async (type) => {
      await dml(`TRUNCATE TABLE ${type}Chart`);
      await dml(`TRUNCATE TABLE ${type}ChartMatch`);
      await dml(`TRUNCATE TABLE ${type}ChartEntry`);

      await addMissing(type, 0, dummyEntries);
      await addMissing(type, 1, dummyEntries);
      const ids = [];
      ids[0] = await getIds(type, 0, dummyEntries);
      ids[1] = await getIds(type, 1, dummyEntries);

      const matches = [
        [
          { entry: ids[0][0].id, idx: 0, id: '1' },
          { entry: ids[0][0].id, idx: 1, id: '2' },
          { entry: ids[0][1].id, idx: 0, id: '3' },
        ],
        [
          { entry: ids[1][0].id, idx: 0, id: '1' },
          { entry: ids[1][1].id, idx: 0, id: '2' },
          { entry: ids[1][1].id, idx: 1, id: '3' },
        ],
      ];

      await add(type, 0, week, ids[0]);
      await add(type, 1, week, ids[1]);
      await addMatches(type, 'en', matches[0]);
      await addMatches(type, 'en', matches[1]);
    })
  );
});

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

test('get tops', async () => {
  const entries = await getTops('en');
  entries.forEach((array) => {
    expect(array.length).toBe(2);
    array.forEach(({ ranking, idx, id }) => {
      expect(ranking).toBe(1);
      expect(idx).toBe(0);
      expect(id).toEqual('1');
    });
  });
});
