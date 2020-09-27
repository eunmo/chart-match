import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import { Clear, Edit, Loupe } from '@material-ui/icons';

import { Context } from './store';
import { get } from './util';
import Flag from './Flag';
import Image from './Image';
import Item from './Item';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr 50px auto 1fr',
    gridColumnGap: theme.spacing(1),
    marginTop: theme.spacing(1),
    fontSize: '1.5em',
    lineHeight: '50px',
  },
  showGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 30px 1fr',
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  editGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 30px 1fr 50px',
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  rank: {
    fontSize: '1.2em',
    lineHeight: '50px',
    textAlign: 'center',
  },
  raw: {
    lineHeight: '50px',
    textAlign: 'center',
  },
}));

export default () => {
  const [songs, setSongs] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const { chart, week } = useParams();
  const [store] = useContext(Context);
  const classes = useStyles();

  useEffect(() => {
    get(`/api/chart/select/single/${chart}/${week}/${store}`, setSongs);
  }, [chart, week, store]);

  const grid = showButtons ? classes.editGrid : classes.showGrid;

  return (
    <Container maxWidth="md">
      <div className={classes.header}>
        <div />
        <div>
          <Flag chart={chart} />
        </div>
        <div>{week} Singles</div>
        <div style={{ textAlign: 'right' }}>
          <IconButton onClick={() => setShowButtons(!showButtons)}>
            {showButtons ? <Clear /> : <Loupe />}
          </IconButton>
        </div>
      </div>
      {songs.map((song) => (
        <div className={grid} key={song.ranking + song.track}>
          {song.catalog ? <Image url={song.catalog.url} /> : <div />}
          <div className={classes.rank}>{song.ranking}</div>
          <Item
            title={song.catalog ? song.catalog.title : song.raw.title}
            subtitle={song.catalog ? song.catalog.artist : song.raw.artist}
          />
          {showButtons && (
            <IconButton
              component={Link}
              to={`/edit/single/${chart}/${song.entry}`}
            >
              <Edit />
            </IconButton>
          )}
          {showButtons &&
            song.catalog && [
              <div
                className={classes.raw}
                style={{ gridColumnStart: 2 }}
                key="raw"
              >
                Raw
              </div>,
              <div key="item">
                <Item title={song.raw.title} subtitle={song.raw.artist} />
              </div>,
            ]}
        </div>
      ))}
    </Container>
  );
};
