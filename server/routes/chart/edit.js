const express = require('express');
const { chartMatch } = require('../../db');
const { queryAppleMusic } = require('./util');

const router = express.Router();

router.put('/single', async (req, res) => {
  const { store, entry, id } = req.body;
  await chartMatch.editSingle(store, entry, 0, id);
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
  await chartMatch.clearSingle(store, entry);

  const toAdd = [];
  songs.forEach((song, track) => {
    toAdd.push({ entry, track, id: song.id });
  });
  await chartMatch.addSingles(store, toAdd);
  res.sendStatus(200);
});

router.delete('/single', async (req, res) => {
  const { store, entry } = req.body;
  await chartMatch.clearSingle(store, entry);
  res.sendStatus(200);
});

router.put('/album', async (req, res) => {
  const { store, entry, id } = req.body;
  await chartMatch.editAlbum(store, entry, id);
  res.sendStatus(200);
});

router.delete('/album', async (req, res) => {
  const { store, entry } = req.body;
  await chartMatch.clearAlbum(store, entry);
  res.sendStatus(200);
});

module.exports = router;
