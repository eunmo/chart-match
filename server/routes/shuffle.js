const express = require('express');
const { chart, favoriteArtist } = require('../db');
const { refDateYMD } = require('./chart/util');
const { queryAppleMusic, searchAppleCatalog } = require('../apple');

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
  let [singleIds, albumIds, favoriteIds] = await Promise.all([
    chart.getWeeks('single', store, weeks),
    chart.getWeeks('album', store, weeks),
    favoriteArtist.getSongs(store),
  ]);

  singleIds = getRandom(singleIds, 20);
  albumIds = getRandom(albumIds, 20);
  favoriteIds = getRandom(favoriteIds, 10);

  const albumUrl = `https://api.music.apple.com/v1/catalog/${store}/albums?ids=${albumIds.join(
    ','
  )}&include=tracks`;
  const albumResponse = await queryAppleMusic(albumUrl);
  const albumSingleIds = [];
  albumResponse.data.forEach((album) => {
    const { 0: id } = getRandom(album.relationships.tracks.data, 1);

    if (id) {
      albumSingleIds.push(id);
    }
  });
  const ids = shuffleArray([...singleIds, ...albumSingleIds, ...favoriteIds]);
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
