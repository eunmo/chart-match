/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const fs = require('fs');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { query } = require('@eunmo/mysql');

const chartMap = { 0: 'us', 1: 'jp', 2: 'gb', 5: 'kr' };

async function checkAlbums(store) {
  const albums = await query(`
   SELECT m.entry, e.chart, m.id
   FROM albumChartMatch m, albumChartEntry e
   WHERE m.entry = e.id
   AND m.store = '${store}'
   AND m.id IS NOT NULL
   ORDER BY m.entry`);

  console.log(albums.length);
  for (let i = 0; i < albums.length; i += 1) {
    const { entry, chart, id } = albums[i];
    const url = `https://music.apple.com/us/album/a/${id}`;
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;

    const preview = doc.querySelectorAll('button.preview-button');
    console.log(i, entry, chart, id);
    const buy = doc.querySelectorAll(
      'button.cta-button.typography-label-emphasized'
    );
    if (buy.length > 0 || preview.length === 0) {
      console.log('!!!');
      const editUrl = `https://chart.eunmo.be/edit/album/${chartMap[chart]}/${entry}\n`;
      fs.appendFile(`${store}-flagged`, editUrl, () => {});
    }
  }
  process.exit(1);
}

checkAlbums('us');
// checkAlbums('jp');
