const { dml, query, cleanup } = require('@eunmo/mysql');
const {
  add,
  edit,
  remove,
  get,
  clearAlbums,
  addAlbums,
  editAlbum,
  getAlbums,
  clearSongs,
  addSongs,
  getSongs,
  getSongCounts,
} = require('../favorite-artist');

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS favoriteArtist');
  await dml('DROP TABLE IF EXISTS favoriteArtistAlbum');
  await dml('DROP TABLE IF EXISTS favoriteArtistSong');
  await dml('CREATE TABLE favoriteArtist LIKE chart.favoriteArtist');
  await dml('CREATE TABLE favoriteArtistAlbum LIKE chart.favoriteArtistAlbum');
  await dml('CREATE TABLE favoriteArtistSong LIKE chart.favoriteArtistSong');
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE favoriteArtistAlbum');
  await dml('TRUNCATE TABLE favoriteArtist');
  await dml('TRUNCATE TABLE favoriteArtistSong');
});

afterAll(async () => {
  await dml('DROP TABLE IF EXISTS favoriteArtistAlbum');
  await dml('DROP TABLE IF EXISTS favoriteArtist');
  await dml('DROP TABLE IF EXISTS favoriteArtistSong');
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

test('add then edit', async () => {
  await add('us', '1', '2', 'name', 'url', 'artwork');
  let rows = await get('us');
  expect(rows.length).toBe(1);
  expect(rows[0].id).toBe('1');
  expect(rows[0].gid).toBe('2');
  expect(rows[0].name).toBe('name');

  await edit('us', '1', '3');
  rows = await get('us');
  expect(rows.length).toBe(1);
  expect(rows[0].gid).toBe('3');
});

test('add albums', async () => {
  const artist = 'artist';
  const albums = [{ id: '1' }, { id: '2' }];
  await addAlbums('us', artist, albums);

  const rows = await query('SELECT * FROM favoriteArtistAlbum');
  expect(rows.length).toBe(2);
});

test('add albums then get', async () => {
  const artist = 'artist';
  const albums = [{ id: '1' }, { id: '2' }];
  await addAlbums('us', artist, albums);

  const rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);
});

test('add albums then clear', async () => {
  const artist = 'artist';
  const albums = [{ id: '1' }, { id: '2' }];
  await addAlbums('us', artist, albums);

  let rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);

  await clearAlbums('us', artist);
  rows = await getAlbums('us', artist);
  expect(rows.length).toBe(0);
});

test('edit album', async () => {
  const artist = 'artist';
  const albums = [{ id: '1' }, { id: '2' }];
  await addAlbums('us', artist, albums);

  let rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);
  rows.forEach(({ included }) => {
    expect(included).toBe(true);
  });

  await editAlbum('us', '1', false);
  await editAlbum('us', '2', false);

  rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);
  rows.forEach(({ included }) => {
    expect(included).toBe(false);
  });
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

test('cascade on delete', async () => {
  await dml(`
    ALTER TABLE favoriteArtistAlbum
    ADD CONSTRAINT faa_fk FOREIGN KEY (store, artist) REFERENCES favoriteArtist (store, id) ON DELETE CASCADE`);
  const artist = '1';
  await add('us', artist, '2', 'name', 'url', 'artwork');
  let rows = await query('SELECT * FROM favoriteArtist');
  expect(rows.length).toBe(1);

  const albums = [{ id: '1' }, { id: '2' }];
  await addAlbums('us', artist, albums);

  rows = await getAlbums('us', artist);
  expect(rows.length).toBe(2);

  await remove('us', artist);
  rows = await get('us');
  expect(rows.length).toBe(0);

  rows = await getAlbums('us', artist);
  expect(rows.length).toBe(0);
});
