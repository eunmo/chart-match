const express = require('express');
const { chartCurrent } = require('../../db');
const { queryAppleMusic } = require('./util');

const router = express.Router();

async function searchAppleCatalog(type, store, ids) {
  if (ids.length === 0) {
    return [];
  }

  const query = `${type}?ids=${ids.join(',')}`;
  const url = `https://api.music.apple.com/v1/catalog/${store}/${query}`;
  const { data } = await queryAppleMusic(url);
  return data;
}

router.get('/single/:store', async (req, res) => {
  const { store } = req.params;
  const songs = await chartCurrent.getSortedSongs(store);
  const shrinked = songs
    .map(({ id, ranks }) => ({ id, rank: ranks[0].ranking }))
    .filter(({ rank }) => rank <= 10);
  const ids = shrinked.map(({ id }) => id);
  const data = await searchAppleCatalog('songs', store, ids);
  const dataMap = {};
  data.forEach((song) => {
    dataMap[song.id] = song;
  });
  const merged = shrinked.map(({ id, rank }) => {
    const {
      attributes: { artistName, name },
    } = dataMap[id];
    return { id, rank, artist: artistName, name };
  });
  res.json(merged);
});

router.get('/album/:store', async (req, res) => {
  const { store } = req.params;
  const albums = await chartCurrent.getSortedAlbums(store);
  const shrinked = albums
    .map(({ id, ranks }) => ({ id, rank: ranks[0].ranking }))
    .filter(({ rank }) => rank <= 10);
  const ids = shrinked.map(({ id }) => id);
  const data = await searchAppleCatalog('albums', store, ids);
  const dataMap = {};
  data.forEach((album) => {
    dataMap[album.id] = album;
  });
  const merged = shrinked.map(({ id, rank }) => {
    const {
      attributes: { artistName, name, url },
    } = dataMap[id];
    return { id, rank, artist: artistName, name, url };
  });
  res.json(merged);
});

function toIds(objects) {
  const set = new Set(objects.map(({ id }) => id));
  return [...set];
}

function merge(objects, data) {
  const dataMap = {};
  data.forEach((d) => {
    dataMap[d.id] = d;
  });
  return objects.map(({ chart, id }) => {
    if (dataMap[id] === undefined) {
      return { chart, id };
    }
    const {
      attributes: {
        artistName,
        name,
        artwork: { url },
      },
    } = dataMap[id];
    return { chart, id, artist: artistName, name, url };
  });
}

router.get('/tops/:store', async (req, res) => {
  const { store } = req.params;
  const [songs, albums] = await chartCurrent.getTops(store);
  const songIds = toIds(songs);
  const albumIds = toIds(albums);
  const [songData, albumData] = await Promise.all([
    searchAppleCatalog('songs', store, songIds),
    searchAppleCatalog('albums', store, albumIds),
  ]);
  const mergedSongs = merge(songs, songData);
  const mergedAlbums = merge(albums, albumData);
  res.json({ songs: mergedSongs, albums: mergedAlbums });
});

module.exports = router;
