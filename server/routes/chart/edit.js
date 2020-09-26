const express = require('express');
const { chartMatch } = require('../../db');

const router = express.Router();

router.put('/single', async (req, res) => {
  const { store, entry, track, id } = req.body;
  await chartMatch.editSingle(store, entry, track, id);
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
