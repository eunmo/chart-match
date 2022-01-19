import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Grid from './Grid';

const years = Array.from({ length: 23 }, (x, i) => `${i + 2000}`);

function refDateYMD(year, weekDiff, dayDiff) {
  const utc = new Date(Date.UTC(year, 0, 1));
  utc.setUTCDate(utc.getUTCDate() - utc.getUTCDay() + weekDiff * 7 + dayDiff);
  return utc.toISOString().substring(0, 10);
}

function getWeeks(year) {
  return Array.from({ length: 55 }, (x, i) => refDateYMD(year, i, 6)).filter(
    (week) => week.substring(0, 4) === year
  );
}

export default function WeekDialog({ handleClose, week, type, chart, open }) {
  const [inYear, setInYear] = useState(false);
  const [year, setYear] = useState(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setYear(week.substring(0, 4));
  }, [week]);

  function selectYear(y) {
    setInYear(false);
    setYear(y);
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="week-dialog-title"
      open={open}
      fullScreen={fullScreen}
    >
      <DialogTitle id="week-dialog-title">
        {inYear ? 'Select Year' : 'Select Week'}
      </DialogTitle>
      <DialogContent>
        <Grid cols="repeat(5, 1fr)" cg={0} rg={0} mb={0}>
          {inYear ? (
            years.map((y) => {
              const style = {};
              if (y === year) {
                style.fontWeight = 'bold';
              }
              return (
                <Button key={y} style={style} onClick={() => selectYear(y)}>
                  {y}
                </Button>
              );
            })
          ) : (
            <>
              <div style={{ gridColumn: '1 / span 5', textAlign: 'center' }}>
                <Button onClick={() => setInYear(true)}>{year}</Button>
              </div>
              {getWeeks(year).map((w) => {
                const style = {};
                if (w.substring(8, 10) < '08') {
                  style.gridColumnStart = 1;
                }
                if (w === week) {
                  style.fontWeight = 'bold';
                }
                return (
                  <Button
                    key={w}
                    style={style}
                    component={Link}
                    to={`/week/${type}/${chart}/${w}`}
                  >
                    {w.substring(5, 10).replace('-', '/')}
                  </Button>
                );
              })}
              <div style={{ gridColumn: '1 / span 5', textAlign: 'center' }}>
                <Button component={Link} to={`/year/${type}/${chart}/${year}`}>
                  {`Top 10 ${type}s`}
                </Button>
              </div>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
