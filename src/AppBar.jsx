import React, { useContext } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import MuiAppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { Context } from './store';
import Link from './Link';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginBottom: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
  },
}));

const colors = {
  jp: '#3f51b5',
  us: '#009688',
};

export default function AppBar() {
  const [store, setStore] = useContext(Context);
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <MuiAppBar position="static" style={{ backgroundColor: colors[store] }}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <Link to="/">Chart Match</Link>
          </Typography>
          <ButtonGroup>
            {['us', 'jp'].map((s) => (
              <Button
                variant={store === s ? 'contained' : 'outlined'}
                onClick={() => setStore(s)}
                key={s}
              >
                {s}
              </Button>
            ))}
          </ButtonGroup>
        </Toolbar>
      </MuiAppBar>
    </div>
  );
}
