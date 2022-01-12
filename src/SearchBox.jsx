import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { Clear, Search } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
  searchBox: {
    padding: '2px 4px',
    display: 'flex',
    flexGrow: 1,
    marginBottom: theme.spacing(1),
  },
  input: {
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));

export default function SearchBox({ keyword, onChange, onSubmit, onClear }) {
  const classes = useStyles();

  return (
    <Paper
      component="form"
      variant="outlined"
      className={classes.searchBox}
      onSubmit={onSubmit}
    >
      <IconButton
        type="submit"
        className={classes.iconButton}
        aria-label="search"
        size="large"
      >
        <Search />
      </IconButton>
      <InputBase
        className={classes.input}
        placeholder="Search Apple Music"
        value={keyword}
        onChange={({ target }) => onChange(target.value)}
        inputProps={{ 'aria-label': 'search apple music' }}
      />
      <IconButton
        className={classes.iconButton}
        aria-label="clear search"
        onClick={onClear}
        size="large"
      >
        <Clear />
      </IconButton>
    </Paper>
  );
}
