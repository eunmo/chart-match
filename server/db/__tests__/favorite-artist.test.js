const { dml, query, cleanup } = require('@eunmo/mysql');
const { add, get } = require('../favorite-artists');

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS favoriteArtists');
  await dml('CREATE TABLE favoriteArtists LIKE chart.favoriteArtists');
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE favoriteArtists');
});

afterAll(async () => {
  await cleanup();
});

test('add', async () => {
  await add('us', '1');
  const rows = await query('SELECT * FROM favoriteArtists');
  expect(rows.length).toBe(1);
});

test('add then get', async () => {
  await add('us', '1');
  let rows = await get('us');
  expect(rows.length).toBe(1);
  expect(rows[0].artist).toBe('1');

  rows = await get('jp');
  expect(rows.length).toBe(0);
});
