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
import AlbumChart from './AlbumChart';
import AppBar from './AppBar';
import SingleChart from './SingleChart';
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
            <Route path="/single/:chart/:week">
              <SingleChart />
            </Route>
            <Route path="/album/:chart/:week">
              <AlbumChart />
            </Route>
            <Route path="/tops">
              <Tops />
            </Route>
            <Redirect from="/" to="/tops" />
          </Switch>
        </Router>
      </StoreProvider>
    </ThemeProvider>
  );
};
