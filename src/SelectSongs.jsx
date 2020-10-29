import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { ArrowDownward, Done } from '@material-ui/icons';

import { useStore } from './store';
import { get, put, deleteBody } from './util';
import Explicit from './Explicit';
import Flag from './Flag';
import Image from './Image';
import Item from './Item';
import SearchBox from './SearchBox';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr 50px auto 1fr',
    gridColumnGap: theme.spacing(1),
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
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: '50px 50px 1fr',
    gridRowGap: theme.spacing(1),
    gridColumnGap: theme.spacing(1),
    lineHeight: '25px',
    marginBottom: theme.spacing(1),
  },
  track: {
    display: 'flex',
    height: '40px',
    lineHeight: '40px',
  },
  bottomButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
}));

export default () => {
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const { chart, entry } = useParams();
  const store = useStore();
  const classes = useStyles();
  const type = 'single';

  useEffect(() => {
    get(
      `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
      setEntries
    );
    setKeyword('');
    setSearchResults(null);
  }, [type, chart, entry, store]);

  if (entries.length === 0) {
    return null;
  }

  function clear() {
    deleteBody(`/api/chart/edit/${type}`, { store, entry }, () => {
      get(
        `/api/chart/select/entry/${type}/${chart}/${entry}/${store}`,
        setEntries
      );
    });
  }

  function submitSearch(e) {
    e.preventDefault();
    get(`/api/search/${type}/${keyword}/${store}`, setSearchResults);
  }

  function fillSearchBox() {
    const { raw } = entries[0];
    const newKeyword = `${raw.artist} ${raw.title}`;
    setKeyword(newKeyword);
    get(`/api/search/${type}/${newKeyword}/${store}`, setSearchResults);
  }

  function clearSearch() {
    setKeyword('');
    setSearchResults(null);
  }

  function chooseAlbum(song) {
    const found = song.attributes.url.match(/\/(\d+)\?i/);
    const albumId = found[1];
    get(`/api/search/tracks/${albumId}/${store}`, (data) => {
      clearSearch();
      setSelectedSongs([]);
      setTracks(data);
    });
  }

  function toggleTrack(track) {
    const index = selectedSongs.indexOf(track.id);
    if (index === -1) {
      setSelectedSongs([...selectedSongs, track.id]);
    } else {
      const newSongs = [...selectedSongs];
      newSongs.splice(index, 1);
      setSelectedSongs(newSongs);
    }
  }

  function submit() {
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
  }

  const { raw } = entries[0];

  return (
    <Container maxWidth="md">
      <div className={classes.header}>
        <div />
        <div>
          <Flag chart={chart} />
        </div>
        <div>Select Singles</div>
      </div>
      <div className={classes.grid}>
        <div className={classes.raw}>Raw</div>
        <Item title={raw.title} subtitle={raw.artist} />
        {entries
          .filter(({ catalog }) => catalog)
          .map((e) => [
            <Link href={e.catalog.url} key={`${e.track} image`}>
              <Image url={e.catalog.artworkUrl} />
            </Link>,
            <Item
              key={`${e.track} item`}
              title={e.catalog.title}
              subtitle={e.catalog.artist}
            />,
          ])}
      </div>
      <div className={classes.buttons}>
        <IconButton onClick={() => fillSearchBox()}>
          <ArrowDownward />
        </IconButton>
        <Button color="secondary" onClick={() => clear()}>
          Clear
        </Button>
      </div>
      <SearchBox
        keyword={keyword}
        onChange={setKeyword}
        onSubmit={submitSearch}
        onClear={clearSearch}
      />
      {searchResults && 'Search Results:'}
      {searchResults?.data?.map((e) => (
        <div className={classes.searchGrid} key={e.id}>
          <IconButton onClick={() => chooseAlbum(e)}>
            <Done />
          </IconButton>
          <Link href={e.attributes.url}>
            <Image url={e.attributes.artwork.url} />
          </Link>
          <Item
            title={<Explicit target={e} />}
            subtitle={e.attributes.artistName}
          />
        </div>
      ))}
      {tracks.map((track) => {
        const index = selectedSongs.indexOf(track.id);
        return (
          <div className={classes.track} key={track.id}>
            <Button onClick={() => toggleTrack(track)}>
              {index === -1 ? <Done /> : index + 1}
            </Button>
            <div>{track.attributes.name}</div>
          </div>
        );
      })}
      {tracks.length > 0 && (
        <div className={classes.bottomButtons}>
          <Button variant="contained" color="primary" onClick={() => submit()}>
            edit
          </Button>
          <Button onClick={() => setSelectedSongs([])}>clear</Button>
        </div>
      )}
    </Container>
  );
};
