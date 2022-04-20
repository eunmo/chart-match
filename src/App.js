import { useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from '@mui/material/styles';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';

import { Provider as StoreProvider } from './store';
import AppBar from './AppBar';
import ChartWeek from './ChartWeek';
import ChartYear from './ChartYear';
import Current from './Current';
import Edit from './Edit';
import FavoriteAlbums from './FavoriteAlbums';
import Favorites from './Favorites';
import SelectSongs from './SelectSongs';
import Tops from './Tops';

export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          flag: prefersDarkMode ? 'darkGray' : 'lightGray',
        },
      }),
    [prefersDarkMode]
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StoreProvider>
          <Router>
            <AppBar />
            <Container maxWidth="md">
              <Routes>
                <Route index element={<Tops />} />
                <Route path="current/:type" element={<Current />} />
                <Route path="week/:type/:chart/:week" element={<ChartWeek />} />
                <Route path="year/:type/:chart/:year" element={<ChartYear />} />
                <Route path="edit/:type/:chart/:entry" element={<Edit />} />
                <Route
                  path="select-songs/:chart/:entry"
                  element={<SelectSongs />}
                />
                <Route
                  path="favorite-albums/:artist"
                  element={<FavoriteAlbums />}
                />
                <Route path="favorites" element={<Favorites />} />
              </Routes>
            </Container>
          </Router>
        </StoreProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
