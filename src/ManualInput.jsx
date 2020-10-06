import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

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

export default ({ multiple, onSubmit }) => {
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
};
