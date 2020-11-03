const { dml, query, cleanup } = require('@eunmo/mysql');
const { add, remove, get } = require('../favorite-artists');

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
  await add('us', '1', '2', 'name', 'url', 'artwork');
  const rows = await query('SELECT * FROM favoriteArtists');
  expect(rows.length).toBe(1);
});

test('add null artwork', async () => {
  await add('us', '1', '2', 'name', 'url');
  const rows = await query('SELECT * FROM favoriteArtists');
  expect(rows.length).toBe(1);
});

test('add then get', async () => {
  await add('us', '1', '2', 'name', 'url', 'artwork');
  let rows = await get('us');
  expect(rows.length).toBe(1);
  expect(rows[0].id).toBe('1');
  expect(rows[0].gid).toBe('2');
  expect(rows[0].name).toBe('name');

  rows = await get('jp');
  expect(rows.length).toBe(0);
});

test('add then remove', async () => {
  await add('us', '1', '2', 'name', 'url', 'artwork');
  let rows = await get('us');
  expect(rows.length).toBe(1);
  expect(rows[0].id).toBe('1');
  expect(rows[0].gid).toBe('2');
  expect(rows[0].name).toBe('name');

  await remove('us', '1');
  rows = await get('us');
  expect(rows.length).toBe(0);
});
