const { dml, query } = require('@eunmo/mysql');
const { chart, chartEntry } = require('../server/db');

async function migrateAlbums() {
  const weeks = await query(`
    SELECT DISTINCT week
    FROM music.AlbumCharts
    WHERE type = 'oricon'
    AND week < '2020-09-05'
    ORDER BY week`);

  const type = 'album';
  const chartId = chart.ids.jp;

  for (let i = 0; i < weeks.length; i += 1) {
    let { week } = weeks[i];
    week = week.toISOString().substring(0, 10);
    const ranks = await query(`
      SELECT \`rank\`, artist, title
      FROM music.AlbumCharts
      WHERE type = 'oricon'
      AND week = '${week}'
      AND \`rank\` <= 100`);
    await chartEntry.addMissing(type, chartId, ranks);
    const entryIds = await chartEntry.getIds(type, chartId, ranks);
    await chart.add(type, chartId, week, entryIds);
    console.log(week);
  }
  process.exit(1);
}

async function migrateSingles() {
  const weeks = await query(`
    SELECT DISTINCT week
    FROM music.SingleCharts
    WHERE type = 'oricon'
    AND week < '2020-09-05'
    ORDER BY week`);

  const type = 'single';
  const chartId = chart.ids.jp;

  for (let i = 0; i < weeks.length; i += 1) {
    let { week } = weeks[i];
    week = week.toISOString().substring(0, 10);
    const rows = await query(`
      SELECT \`rank\`, artist, title, \`order\`
      FROM music.SingleCharts
      WHERE type = 'oricon'
      AND week = '${week}'
      AND \`rank\` <= 100
      ORDER BY \`rank\`, \`order\``);

    const ranks = [];
    rows.forEach(({ rank, artist, title, order }) => {
      if (ranks[rank - 1] === undefined) {
        ranks[rank - 1] = { rank, artist, title };
      } else {
        ranks[rank - 1].title = `${ranks[rank - 1].title}/${title}`;
      }
    });
    await chartEntry.addMissing(type, chartId, ranks);
    const entryIds = await chartEntry.getIds(type, chartId, ranks);
    await chart.add(type, chartId, week, entryIds);
    console.log(week);
  }
  process.exit(1);
}

//migrateAlbums();
//migrateSingles();
