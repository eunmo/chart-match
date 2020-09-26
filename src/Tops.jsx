import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Context } from './store';
import { get } from './util';
import Flag from './flag';
import Image from './Image';
import Item from './Item';
import Link from './Link';

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
}));

export default () => {
  const [charts, setCharts] = useState([]);
  const [store] = useContext(Context);
  const classes = useStyles();

  useEffect(() => {
    get(`/api/chart/current/tops/${store}`, (data) => {
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
  }, [store]);

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
            <Link to={`/album/${chart}/${song.week}`}>
              <div className={classes.albumGrid}>
                <Item title={album.name} subtitle={album.artist} />
                <div>
                  <Image url={album.url} />
                </div>
              </div>
            </Link>
          </div>,
          <div key={`${chart} flag`}>
            <Flag chart={chart} />
          </div>,
          <div key={`${chart} song`}>
            <Link to={`/single/${chart}/${song.week}`}>
              <div className={classes.songGrid}>
                <div>
                  <Image url={song.url} />
                </div>
                <Item title={song.name} subtitle={song.artist} />
              </div>
            </Link>
          </div>,
        ])}
      </div>
    </div>
  );
};
