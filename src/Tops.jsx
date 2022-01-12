import React, { useEffect, useState, Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { useStore } from './store';
import { get } from './util';
import Flag from './Flag';
import Image from './Image';
import Item from './Item';
import Link from './Link';

const baseGridSx = { columnGap: 1, display: 'grid' };
const gridSx = { ...baseGridSx, gridTemplateColumns: '1fr 50px 1fr' };
const albumGridSx = {
  ...baseGridSx,
  gridTemplateColumns: '1fr 50px',
  textAlign: 'right',
};
const songGridSx = { ...baseGridSx, gridTemplateColumns: '50px 1fr' };
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
      <Box sx={{ ...gridSx, lineHeight: '50px', fontSize: '1.2em' }}>
        <div style={{ textAlign: 'right' }}>
          <Link to="/current/album">Albums</Link>
        </div>
        <div style={{ gridColumnStart: 3 }}>
          <Link to="/current/single">Singles</Link>
        </div>
      </Box>
      <Box sx={{ ...gridSx, lineHeight: '25px', mb: 1 }}>
        {charts.map(({ chart, song, album }) => (
          <Fragment key={chart}>
            <div>
              <Link to={`/week/album/${chart}/${album.week}`}>
                {album.url ? (
                  <Box sx={albumGridSx}>
                    <Item title={album.name} subtitle={album.artist} />
                    <div>
                      <Image url={album.url} />
                    </div>
                  </Box>
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
                  <Box sx={songGridSx}>
                    <div>
                      <Image url={song.url} />
                    </div>
                    <Item title={song.name} subtitle={song.artist} />
                  </Box>
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
      </Box>
    </>
  );
}
