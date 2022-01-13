import React, { useEffect, useState, Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { useStore } from './store';
import { get } from './util';
import Flag from './Flag';
import Grid from './Grid';
import Image from './Image';
import Item from './Item';
import Link from './Link';

const filler = <Box height="100%" width="100%" />;

export default function Tops() {
  const [charts, setCharts] = useState([]);
  const store = useStore();

  useEffect(() => {
    get(`/api/chart/current/tops/${store}`, (data) => {
      const { songs, albums } = data;
      const newCharts = [
        { id: 0, chart: 'us' },
        { id: 1, chart: 'jp' },
        { id: 2, chart: 'gb' },
        { id: 4, chart: 'fr' },
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
    <>
      <Box fontSize="1.5em" lineHeight="50px" textAlign="center">
        Latest Charts
      </Box>
      <Grid cols="1fr 50px 1fr" lh={50} sx={{ fontSize: '1.2em' }}>
        <div style={{ textAlign: 'right' }}>
          <Link to="/current/album">Albums</Link>
        </div>
        <div style={{ gridColumnStart: 3 }}>
          <Link to="/current/single">Singles</Link>
        </div>
      </Grid>
      <Grid cols="1fr 50px 1fr" rg={0}>
        {charts.map(({ chart, song, album }) => (
          <Fragment key={chart}>
            <div>
              <Link to={`/week/album/${chart}/${album.week}`}>
                {album.url ? (
                  <Grid cols="1fr 50px" sx={{ textAlign: 'right' }}>
                    <Item title={album.name} subtitle={album.artist} />
                    <div>
                      <Image url={album.url} />
                    </div>
                  </Grid>
                ) : (
                  filler
                )}
              </Link>
            </div>
            <div>
              <Flag chart={chart} />
            </div>
            <div>
              <Link to={`/week/single/${chart}/${song.week}`}>
                {song.url ? (
                  <Grid cols="50px 1fr">
                    <div>
                      <Image url={song.url} />
                    </div>
                    <Item title={song.name} subtitle={song.artist} />
                  </Grid>
                ) : (
                  filler
                )}
              </Link>
            </div>
          </Fragment>
        ))}
        <Box sx={{ gridColumn: '2 / 3' }}>
          <IconButton
            color="primary"
            aria-label="favorites"
            component={RouterLink}
            to="/favorites"
            size="large"
          >
            <FavoriteIcon />
          </IconButton>
        </Box>
      </Grid>
    </>
  );
}
