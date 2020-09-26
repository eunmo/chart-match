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
  const [album, setAlbum] = useState(undefined);
  const { chart, entry } = useParams();
  const [store] = useContext(Context);
  const classes = useStyles();

  useEffect(() => {
    get(`/api/chart/select/album-entry/${chart}/${entry}/${store}`, setAlbum);
  }, [chart, entry, store]);

  if (album === undefined) {
    return null;
  }

  function clear() {
    deleteBody('/api/chart/edit/album', { store, entry }, () => {
      get(`/api/chart/select/album-entry/${chart}/${entry}/${store}`, setAlbum);
    });
  }

  const { catalog, raw } = album;

  return (
    <Container maxWidth="md">
      <div className={classes.header}>
        <div />
        <div>
          <Flag chart={chart} />
        </div>
        <div>Edit Album</div>
      </div>
      <div className={classes.grid}>
        <div className={classes.raw}>Raw</div>
        <Item title={raw.title} subtitle={raw.artist} />
        {catalog && [
          <Image key="image" url={catalog.url} />,
          <Item key="item" title={catalog.title} subtitle={catalog.artist} />,
        ]}
      </div>
      <Button color="secondary" onClick={() => clear()}>
        Clear
      </Button>
    </Container>
  );
};
