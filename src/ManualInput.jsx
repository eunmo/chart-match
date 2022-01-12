import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const useStyles = makeStyles({
  header: {
    margin: '16px 0px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: '24px',
  },
});

export default function ManualInput({ multiple, onSubmit }) {
  const [ids, setIds] = useState(['']);
  const classes = useStyles();

  function onChange(event, index) {
    const newIds = [...ids];
    newIds[index] = event.target.value;
    setIds(newIds);
  }

  return (
    <>
      <div className={classes.header}>
        <Typography variant="h5">Manual Input</Typography>
        {multiple && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIds([...ids, ''])}
            aria-label="+1"
          >
            +1
          </Button>
        )}
      </div>
      <Grid container spacing={2}>
        {ids.map((id, index) => {
          const label = multiple && ids.length > 1 ? `ID ${index + 1}` : 'ID';
          return (
            <Grid item xs={12} sm={3} key={label}>
              <TextField
                fullWidth
                label={label}
                value={id}
                onChange={(e) => onChange(e, index)}
              />
            </Grid>
          );
        })}
      </Grid>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={() => onSubmit(ids.filter((id) => id !== ''))}
        aria-label="edit"
      >
        edit
      </Button>
    </>
  );
}
