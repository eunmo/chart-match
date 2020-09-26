import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';

import { Context } from './store';
import { get, deleteBody } from './util';
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
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
  const { chart, entry } = useParams();
  const [store] = useContext(Context);
  const classes = useStyles();

  useEffect(() => {
    get(`/api/chart/select/single-entry/${chart}/${entry}/${store}`, setSongs);
  }, [chart, entry, store]);

  if (songs.length === 0) {
    return null;
  }

  function clear() {
    deleteBody('/api/chart/edit/single', { store, entry }, () => {
      get(
        `/api/chart/select/single-entry/${chart}/${entry}/${store}`,
        setSongs
      );
    });
  }

  const { raw } = songs[0];

  return (
    <Container maxWidth="md">
      <div className={classes.header}>
        <div />
        <div>
          <Flag chart={chart} />
        </div>
        <div>Edit Single</div>
      </div>
      <div className={classes.grid}>
        <div className={classes.raw}>Raw</div>
        <Item title={raw.title} subtitle={raw.artist} />
        {songs
          .filter(({ catalog }) => catalog)
          .map((song) => [
            <Image key={`${song.track} image`} url={song.catalog.url} />,
            <Item
              key={`${song.track} item`}
              title={song.catalog.title}
              subtitle={song.catalog.artist}
            />,
          ])}
      </div>
      <Button color="secondary" onClick={() => clear()}>
        Clear
      </Button>
    </Container>
  );
};
