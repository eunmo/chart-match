import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  header: {
    margin: '16px 0px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: '24px',
  },
});

export default ({ multiple, onSubmit }) => {
  const [id1, setId1] = useState('');
  const [id2, setId2] = useState('');
  const [id3, setId3] = useState('');
  const [id4, setId4] = useState('');
  const [count, setCount] = useState(1);
  const classes = useStyles();

  const ids = [
    [id1, setId1, 'ID 1'],
    [id2, setId2, 'ID 2'],
    [id3, setId3, 'ID 3'],
    [id4, setId4, 'ID 4'],
  ];

  return (
    <>
      <Typography variant="h5" className={classes.header}>
        Manual Input
      </Typography>
      <Grid container spacing={2}>
        {ids.slice(0, count).map(([id, setId, name]) => (
          <Grid item xs={12} sm={3} key={name}>
            <TextField
              fullWidth
              label={multiple ? name : 'ID'}
              value={id}
              onChange={(e) => setId(e.target.value)}
              inputProps={{ 'aria-label': multiple ? name : 'ID' }}
            />
          </Grid>
        ))}
      </Grid>
      <div className={classes.buttons}>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => onSubmit([id1, id2, id3, id4].slice(0, count))}
          aria-label="edit"
        >
          edit
        </Button>
        {multiple && count < 4 && (
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            onClick={() => setCount(count + 1)}
            aria-label="+1"
          >
            +1
          </Button>
        )}
      </div>
    </>
  );
};
