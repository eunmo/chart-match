const express = require('express');
const { chart } = require('../db');
const {
  refDateYMD,
  searchAppleCatalog,
  queryAppleMusic,
} = require('./chart/util');

const router = express.Router();

function getWeeks() {
  const today = new Date();
  const yy = today.getFullYear();
  const mm = today.getMonth();
  const dd = today.getDate();

  const weeks = [];
  for (let y = 2000; y <= yy; y += 1) {
    const week = new Date(y, mm, dd).toISOString().substring(0, 10);
    weeks.push(refDateYMD(week, 0, 6));
  }

  return weeks;
}

function getRandom(ids, count) {
  const newIds = new Set();
  while (newIds.size < count) {
    newIds.add(ids[Math.floor(Math.random() * ids.length)].id);
  }
  return [...newIds];
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

router.get('/:store', async (req, res) => {
  const { store } = req.params;
  const weeks = getWeeks();
  let [singleIds, albumIds] = await Promise.all([
    chart.getWeeks('single', store, weeks),
    chart.getWeeks('album', store, weeks),
  ]);

  singleIds = getRandom(singleIds, 25);
  albumIds = getRandom(albumIds, 25);

  const albumUrl = `https://api.music.apple.com/v1/catalog/${store}/albums?ids=${albumIds.join(
    ','
  )}&include=tracks`;
  const albumResponse = await queryAppleMusic(albumUrl);
  let albumSingleIds = [];
  albumResponse.data.forEach((album) => {
    album.relationships.tracks.data.forEach(({ id }) => {
      albumSingleIds.push({ id });
    });
  });
  albumSingleIds = getRandom(albumSingleIds, 25);
  const ids = shuffleArray(singleIds.concat(albumSingleIds));
  const dataMap = await searchAppleCatalog('songs', store, ids);
  const merged = [];
  ids.forEach((id) => {
    if (dataMap[id]) {
      const {
        attributes: { artistName, name },
      } = dataMap[id];
      merged.push({ id, artist: artistName, name, rank: merged.length + 1 });
    }
  });
  res.json(merged);
});

module.exports = router;
