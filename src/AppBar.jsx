import React, { useCallback, useContext } from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { Context } from './store';
import Link from './Link';

export default function AppBar() {
  const [store, setStore] = useContext(Context);

  const changeStore = useCallback(
    (e, newStore) => {
      if (newStore) {
        setStore(newStore);
      }
    },
    [setStore]
  );

  return (
    <Box mb={1}>
      <MuiAppBar position="static">
        <Toolbar>
          <Typography variant="h6" flexGrow={1}>
            <Link to="/">Chart Match</Link>
          </Typography>
          <ToggleButtonGroup value={store} exclusive onChange={changeStore}>
            {['us', 'jp'].map((s) => (
              <ToggleButton value={s} key={s} size="small">
                {s}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Toolbar>
      </MuiAppBar>
    </Box>
  );
}
