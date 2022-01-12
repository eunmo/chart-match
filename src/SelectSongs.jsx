import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { ArrowDownward, Done } from '@mui/icons-material';

import { useStore } from './store';
import { get, put, deleteBody } from './util';
import EditInfo from './EditInfo';
import Explicit from './Explicit';
import Grid from './Grid';
import Image from './Image';
import Item from './Item';
import SearchBox from './SearchBox';

export default function SelectSongs() {
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const { chart, entry } = useParams();
  const store = useStore();
  const type = 'single';

  useEffect(() => {
    get(
      `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
      setEntries
    );
    setKeyword('');
    setSearchResults(null);
  }, [type, chart, entry, store]);

  const clear = useCallback(() => {
    deleteBody(`/api/chart/edit/${type}`, { store, entry }, () => {
      get(
        `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
        setEntries
      );
    });
  }, [chart, entry, store, type]);

  const submitSearch = useCallback(
    (e) => {
      e.preventDefault();
      get(`/api/search/${type}/${keyword}/${store}`, setSearchResults);
    },
    [keyword, store, type]
  );

  const fillSearchBox = useCallback(() => {
    const { raw } = entries[0];
    const newKeyword = `${raw.artist} ${raw.title}`;
    setKeyword(newKeyword);
    get(`/api/search/${type}/${newKeyword}/${store}`, setSearchResults);
  }, [entries, store, type]);

  const clearSearch = useCallback(() => {
    setKeyword('');
    setSearchResults(null);
  }, []);

  const chooseAlbum = useCallback(
    (song) => {
      const found = song.attributes.url.match(/\/(\d+)\?i/);
      const albumId = found[1];
      get(`/api/search/tracks/${albumId}/${store}`, (data) => {
        clearSearch();
        setSelectedSongs([]);
        setTracks(data);
      });
    },
    [clearSearch, store]
  );

  const toggleTrack = useCallback(
    (track) => {
      const index = selectedSongs.indexOf(track.id);
      if (index === -1) {
        setSelectedSongs([...selectedSongs, track.id]);
      } else {
        const newSongs = [...selectedSongs];
        newSongs.splice(index, 1);
        setSelectedSongs(newSongs);
      }
    },
    [selectedSongs]
  );

  const submit = useCallback(() => {
    if (selectedSongs.length > 0) {
      put(
        `/api/chart/edit/ids/${type}`,
        { store, entry, ids: selectedSongs },
        () => {
          setTracks([]);
          get(
            `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
            setEntries
          );
        }
      );
    }
  }, [chart, entry, selectedSongs, store, type]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <>
      <EditInfo chart={chart} title="select singles" entries={entries} />
      <Box display="flex" justifyContent="space-between" mb={1}>
        <IconButton onClick={() => fillSearchBox()} size="large">
          <ArrowDownward />
        </IconButton>
        <Button color="secondary" onClick={() => clear()}>
          Clear
        </Button>
      </Box>
      <SearchBox
        keyword={keyword}
        onChange={setKeyword}
        onSubmit={submitSearch}
        onClear={clearSearch}
      />
      {searchResults && 'Search Results:'}
      {searchResults?.data?.map((e) => (
        <Grid cols="50px 50px 1fr" rg={1} mb={1} key={e.id}>
          <IconButton onClick={() => chooseAlbum(e)} size="large">
            <Done />
          </IconButton>
          <Link href={e.attributes.url}>
            <Image url={e.attributes.artwork.url} />
          </Link>
          <Item
            title={<Explicit target={e} />}
            subtitle={e.attributes.artistName}
          />
        </Grid>
      ))}
      {tracks.map((track) => {
        const index = selectedSongs.indexOf(track.id);
        return (
          <Box display="flex" height="40px" lineHeight="40px" key={track.id}>
            <Button onClick={() => toggleTrack(track)}>
              {index === -1 ? <Done /> : index + 1}
            </Button>
            <div>{track.attributes.name}</div>
          </Box>
        );
      })}
      {tracks.length > 0 && (
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button variant="contained" color="primary" onClick={() => submit()}>
            edit
          </Button>
          <Button onClick={() => setSelectedSongs([])}>clear</Button>
        </Box>
      )}
    </>
  );
}
