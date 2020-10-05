const express = require('express');
const { chartMatch } = require('../../db');
const { queryAppleMusic } = require('./util');

const router = express.Router();

router.delete('/:type', async (req, res) => {
  const { type } = req.params;
  const { store, entry } = req.body;
  await chartMatch.remove(type, store, entry);
  await chartMatch.add(type, store, [{ entry, idx: 0, id: null }]);
  res.sendStatus(200);
});

router.put('/id/:type', async (req, res) => {
  const { type } = req.params;
  const { store, entry, id } = req.body;
  await chartMatch.remove(type, store, entry);
  await chartMatch.add(type, store, [{ entry, idx: 0, id }]);
  res.sendStatus(200);
});

router.put('/ids/:type', async (req, res) => {
  const { type } = req.params;
  const { store, entry, ids } = req.body;
  const toAdd = ids.map((id, idx) => ({ entry, idx, id }));
  await chartMatch.remove(type, store, entry);
  await chartMatch.add(type, store, toAdd);
  res.sendStatus(200);
});

router.put('/singles', async (req, res) => {
  const { store, entry, url, count } = req.body;
  const found = url.match(/\/(\d+)\?i/);
  const albumId = found[1];
  const albumUrl = `https://api.music.apple.com/v1/catalog/${store}/albums/${albumId}/tracks`;
  const albumResponse = await queryAppleMusic(albumUrl);
  if (albumResponse.data.length < count) {
    res.sendStatus(200);
    return;
  }

  const songs = albumResponse.data.slice(0, count);
  await chartMatch.remove('single', store, entry);

  const toAdd = [];
  songs.forEach((song, idx) => {
    toAdd.push({ entry, idx, id: song.id });
  });
  await chartMatch.add('single', store, toAdd);
  res.sendStatus(200);
});

module.exports = router;
