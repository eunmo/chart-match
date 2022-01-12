import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

import { useStore } from './store';
import { get, put } from './util';
import Image from './Image';
import Item from './Item';

const useStyles = makeStyles((theme) => ({
  entryGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr 50px',
    gridRowGap: theme.spacing(1),
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
}));

export default function FavoriteAlbums() {
  const [entries, setEntries] = useState([]);
  const [included, setIncluded] = useState({});
  const { artist } = useParams();
  const store = useStore();
  const classes = useStyles();

  const fetch = useCallback(() => {
    setEntries([]);
    setIncluded({});
    get(`/api/favorite-artist/albums/${store}/${artist}`, (data) => {
      const newIncluded = {};
      data.forEach(({ id, included: i }) => {
        newIncluded[id] = i;
      });
      setIncluded(newIncluded);

      function compareAlbums(a, b) {
        if (a.attributes.releaseDate < b.attributes.releaseDate) {
          return -1;
        }

        if (a.attributes.releaseDate > b.attributes.releaseDate) {
          return 1;
        }

        return 0;
      }
      setEntries(data.sort(compareAlbums));
    });
  }, [store, artist]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  function update() {
    put(`/api/favorite-artist/edit-albums`, { store, included }, () => {
      fetch();
    });
  }

  function onChange(id) {
    setIncluded({ ...included, [id]: !included[id] });
  }

  function turnOff() {
    const newIncluded = {};
    Object.keys(included).forEach((id) => {
      newIncluded[id] = false;
    });
    setIncluded(newIncluded);
  }

  return (
    <Container maxWidth="md">
      <Button onClick={turnOff}>Unselect All</Button>
      {entries.map(({ id, attributes }) => (
        <div key={id} className={classes.entryGrid}>
          <Link href={attributes.url}>
            <Image url={attributes.artwork.url} />
          </Link>
          <Item
            title={attributes.name}
            subtitle={`${attributes.releaseDate} ${attributes.trackCount} Songs`}
          />
          <Checkbox checked={included[id]} onChange={() => onChange(id)} />
        </div>
      ))}
      <Button variant="contained" color="primary" onClick={update}>
        Update
      </Button>
    </Container>
  );
}
