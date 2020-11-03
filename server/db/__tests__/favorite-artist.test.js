const { dml, query, cleanup } = require('@eunmo/mysql');
const {
  add,
  remove,
  get,
  clearSongs,
  addSongs,
  getSongs,
  getSongCounts,
} = require('../favorite-artist');

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS favoriteArtist');
  await dml('DROP TABLE IF EXISTS favoriteArtistSong');
  await dml('CREATE TABLE favoriteArtist LIKE chart.favoriteArtist');
  await dml('CREATE TABLE favoriteArtistSong LIKE chart.favoriteArtistSong');
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE favoriteArtist');
  await dml('TRUNCATE TABLE favoriteArtistSong');
});

afterAll(async () => {
  await cleanup();
});

test('add', async () => {
  await add('us', '1', '2', 'name', 'url', 'artwork');
  const rows = await query('SELECT * FROM favoriteArtist');
  expect(rows.length).toBe(1);
});

test('add null artwork', async () => {
  await add('us', '1', '2', 'name', 'url');
  const rows = await query('SELECT * FROM favoriteArtist');
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

test('add songs', async () => {
  const songs = [{ id: '1' }, { id: '2' }];
  await addSongs('us', '3', songs);

  const rows = await query('SELECT * FROM favoriteArtistSong');
  expect(rows.length).toBe(2);
});

test('add songs then get', async () => {
  const songs = [{ id: '1' }, { id: '2' }];
  await addSongs('us', '3', songs);

  let rows = await getSongs('us');
  expect(rows.length).toBe(2);

  rows = await getSongCounts('us');
  expect(rows.length).toBe(1);
});

test('add songs then clear', async () => {
  const songs = [{ id: '1' }, { id: '2' }];
  await addSongs('us', '3', songs);
  let rows = await query('SELECT * FROM favoriteArtistSong');
  expect(rows.length).toBe(2);

  await clearSongs('us');
  rows = await query('SELECT * FROM favoriteArtistSong');
  expect(rows.length).toBe(0);
});
