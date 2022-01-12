import React, { useCallback, useEffect, useState, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';

import { useStore } from './store';
import { get, put } from './util';
import Grid from './Grid';
import Image from './Image';
import Item from './Item';

export default function FavoriteAlbums() {
  const [entries, setEntries] = useState([]);
  const [included, setIncluded] = useState({});
  const { artist } = useParams();
  const store = useStore();

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

  const update = useCallback(() => {
    put(`/api/favorite-artist/edit-albums`, { store, included }, () => {
      fetch();
    });
  }, [fetch, included, store]);

  const onChange = useCallback(
    (id) => {
      setIncluded({ ...included, [id]: !included[id] });
    },
    [included]
  );

  const turnOff = useCallback(() => {
    const newIncluded = {};
    Object.keys(included).forEach((id) => {
      newIncluded[id] = false;
    });
    setIncluded(newIncluded);
  }, [included]);

  return (
    <>
      <Button onClick={turnOff}>Unselect All</Button>
      <Grid cols="50px 1fr 50px">
        {entries.map(({ id, attributes }) => (
          <Fragment key={id}>
            <Link href={attributes.url}>
              <Image url={attributes.artwork.url} />
            </Link>
            <Item
              title={attributes.name}
              subtitle={`${attributes.releaseDate} ${attributes.trackCount} Songs`}
            />
            <Checkbox checked={included[id]} onChange={() => onChange(id)} />
          </Fragment>
        ))}
      </Grid>
      <Button variant="contained" color="primary" onClick={update}>
        Update
      </Button>
    </>
  );
}
