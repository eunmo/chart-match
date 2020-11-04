import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { Provider as StoreProvider } from './store';
import AppBar from './AppBar';
import ChartWeek from './ChartWeek';
import Current from './Current';
import Edit from './Edit';
import FavoriteAlbums from './FavoriteAlbums';
import Favorites from './Favorites';
import SelectSongs from './SelectSongs';
import Tops from './Tops';

export default () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
          flag: prefersDarkMode ? 'darkGray' : 'lightGray',
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreProvider>
        <Router>
          <AppBar />
          <Switch>
            <Route path="/current/:type">
              <Current />
            </Route>
            <Route path="/week/:type/:chart/:week">
              <ChartWeek />
            </Route>
            <Route path="/edit/:type/:chart/:entry">
              <Edit />
            </Route>
            <Route path="/select-songs/:chart/:entry">
              <SelectSongs />
            </Route>
            <Route path="/tops">
              <Tops />
            </Route>
            <Route path="/favorite-albums/:artist">
              <FavoriteAlbums />
            </Route>
            <Route path="/favorites">
              <Favorites />
            </Route>
            <Redirect from="/" to="/tops" />
          </Switch>
        </Router>
      </StoreProvider>
    </ThemeProvider>
  );
};
