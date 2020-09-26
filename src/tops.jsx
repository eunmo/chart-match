import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { ReactComponent as US } from './svg/us.svg';
import { ReactComponent as JP } from './svg/jp.svg';
import { ReactComponent as GB } from './svg/gb.svg';
import { ReactComponent as KR } from './svg/kr.svg';

import { get } from './util';

const useStyles = makeStyles((theme) => ({
  header: {
    fontSize: '1.2em',
    lineHeight: '50px',
    textAlign: 'center',
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
}));

function getFlag(chart) {
  if (chart === 'us') {
    return <US width="50" height="50" />;
  }

  if (chart === 'jp') {
    return <JP width="50" height="50" />;
  }

  if (chart === 'gb') {
    return <GB width="50" height="50" />;
  }

  if (chart === 'kr') {
    return <KR width="50" height="50" />;
  }

  return chart;
}

function image(url, id, size = 50) {
  const sizeString = `${size}`;
  const imageUrl = url.replace('{w}', sizeString).replace('{h}', sizeString);
  return <img src={imageUrl} alt={id} style={{ borderRadius: '50%' }} />;
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
    <div className={classes.grid}>
      <div className={classes.header}>Album</div>
      <div />
      <div className={classes.header}>Single</div>
      {charts.map(({ chart, song, album }) => [
        <div key={`${chart} album`}>
          <div className={classes.albumGrid}>
            <div className={classes.overflow}>
              <div className={classes.ellipsis}>{album.name}</div>
              <div className={classes.ellipsis} style={{ color: 'gray' }}>
                {album.artist}
              </div>
            </div>
            <div>{image(album.url, album.id)}</div>
          </div>
        </div>,
        <div key={`${chart} flag`}>{getFlag(chart)}</div>,
        <div key={`${chart} song`}>
          <div className={classes.songGrid}>
            <div>{image(song.url, song.id)}</div>
            <div className={classes.overflow}>
              <div className={classes.ellipsis}>{song.name}</div>
              <div className={classes.ellipsis} style={{ color: 'gray' }}>
                {song.artist}
              </div>
            </div>
          </div>
        </div>,
      ])}
    </div>
  );
};
