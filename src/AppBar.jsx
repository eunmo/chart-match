import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

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

export default () => {
  const [store, setStore] = useContext(Context);
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static" style={{ backgroundColor: colors[store] }}>
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
      </AppBar>
    </div>
  );
};
