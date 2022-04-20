import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { Clear, Loupe } from '@mui/icons-material';

import { useStore } from './store';
import { get } from './util';
import ChartRows from './ChartRows';
import Header from './Header';
import WeekDialog from './WeekDialog';

export default function ChartWeek() {
  const [entries, setEntries] = useState(undefined);
  const [showButtons, setShowButtons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { type, chart, week } = useParams();
  const store = useStore();

  useEffect(() => {
    setEntries(undefined);
    setOpenDialog(false);
    setShowButtons(false);
    get(`/api/chart/select/week/${type}/${chart}/${week}/${store}`, setEntries);
  }, [type, chart, week, store]);

  async function fetchChart() {
    setEntries(undefined);
    setLoading(true);
    await fetch(`/api/chart/fetch/${type}/${chart}/${week}`);
    setLoading(false);
    setShowButtons(false);
    get(`/api/chart/select/week/${type}/${chart}/${week}/${store}`, setEntries);
  }

  async function matchChart() {
    setEntries(undefined);
    setLoading(true);
    await fetch(`/api/chart/match/${type}/${chart}/${week}/us`);
    await fetch(`/api/chart/match/${type}/${chart}/${week}/jp`);
    setLoading(false);
    setShowButtons(false);
    get(`/api/chart/select/week/${type}/${chart}/${week}/${store}`, setEntries);
  }

  async function fetchMatchChart() {
    setEntries(undefined);
    setLoading(true);
    await fetch(`/api/chart/fetch/${type}/${chart}/${week}`);
    await fetch(`/api/chart/match/${type}/${chart}/${week}/us`);
    await fetch(`/api/chart/match/${type}/${chart}/${week}/jp`);
    setLoading(false);
    setShowButtons(false);
    get(`/api/chart/select/week/${type}/${chart}/${week}/${store}`, setEntries);
  }

  return (
    <>
      <Header chart={chart}>
        <div>
          <Button onClick={() => setOpenDialog(true)}>
            {week} {type}s
          </Button>
        </div>
        <Box textAlign="right">
          <IconButton onClick={() => setShowButtons(!showButtons)} size="large">
            {showButtons ? <Clear /> : <Loupe />}
          </IconButton>
        </Box>
      </Header>
      <ChartRows
        type={type}
        chart={chart}
        entries={entries}
        showButtons={showButtons}
      />
      {loading && (
        <div>
          <CircularProgress />
        </div>
      )}
      {(showButtons || entries?.length === 0) && !loading && (
        <ButtonGroup>
          <Button onClick={() => fetchChart()}>Fetch</Button>
          <Button onClick={() => matchChart()}>Match</Button>
          <Button onClick={() => fetchMatchChart()}>Do Both</Button>
        </ButtonGroup>
      )}
      <WeekDialog
        handleClose={() => setOpenDialog(false)}
        week={week}
        type={type}
        chart={chart}
        open={openDialog}
      />
    </>
  );
}
