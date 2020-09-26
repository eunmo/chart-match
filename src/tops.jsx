import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { get } from './util';
import Flag from './flag';

const useStyles = makeStyles((theme) => ({
  header: {
    fontSize: '1.5em',
    lineHeight: '50px',
    textAlign: 'center',
  },
  subheader: {
    display: 'grid',
    gridTemplateColumns: '1fr 50px 1fr',
    gridColumnGap: theme.spacing(1),
    fontSize: '1.2em',
    lineHeight: '50px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 50px 1fr',
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  albumGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 50px',
    gridColumnGap: theme.spacing(1),
    textAlign: 'right',
  },
  songGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    gridColumnGap: theme.spacing(1),
  },
  overflow: {
    overflow: 'hidden',
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  artist: {
    color: theme.palette.text.secondary,
  },
}));

function replaceUrl(url, size) {
  const sizeString = `${size}`;
  return url.replace('{w}', sizeString).replace('{h}', sizeString);
}

function image(url, id, size = 50) {
  const imageUrl = replaceUrl(url, size);
  const srcset = [1, 2, 3]
    .map((n) => `${replaceUrl(url, size * n)} ${n}x`)
    .join(',');
  return (
    <div style={{ width: size, height: size }}>
      <img
        src={imageUrl}
        srcSet={srcset}
        alt={id}
        style={{ borderRadius: '50%' }}
      />
    </div>
  );
}

export default () => {
  const [charts, setCharts] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    get('/api/chart/current/tops/jp', (data) => {
      const { songs, albums } = data;
      const newCharts = [
        { id: 0, chart: 'us' },
        { id: 1, chart: 'jp' },
        { id: 2, chart: 'gb' },
        { id: 5, chart: 'kr' },
      ];
      songs.forEach((song) => {
        const chart = newCharts.find(({ id }) => id === song.chart);
        chart.song = song;
      });
      albums.forEach((album) => {
        const chart = newCharts.find(({ id }) => id === album.chart);
        chart.album = album;
      });
      setCharts(newCharts);
    });
  }, []);

  return (
    <div>
      <div className={classes.header}>Latest Charts</div>
      <div className={classes.subheader}>
        <div style={{ textAlign: 'right' }}>Albums</div>
        <div style={{ gridColumnStart: 3 }}>Singles</div>
      </div>
      <div className={classes.grid}>
        {charts.map(({ chart, song, album }) => [
          <div key={`${chart} album`}>
            <div className={classes.albumGrid}>
              <div className={classes.overflow}>
                <div className={classes.ellipsis}>{album.name}</div>
                <div className={`${classes.ellipsis} ${classes.artist}`}>
                  {album.artist}
                </div>
              </div>
              <div>{image(album.url, album.id)}</div>
            </div>
          </div>,
          <div key={`${chart} flag`}>
            <Flag chart={chart} />
          </div>,
          <div key={`${chart} song`}>
            <div className={classes.songGrid}>
              <div>{image(song.url, song.id)}</div>
              <div className={classes.overflow}>
                <div className={classes.ellipsis}>{song.name}</div>
                <div className={`${classes.ellipsis} ${classes.artist}`}>
                  {song.artist}
                </div>
              </div>
            </div>
          </div>,
        ])}
      </div>
    </div>
  );
};
