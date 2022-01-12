import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  overflow: {
    overflow: 'hidden',
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  title: {
    color: theme.palette.text.primary,
  },
  subtitle: {
    color: theme.palette.text.secondary,
  },
}));

export default function Item({ title, subtitle }) {
  const classes = useStyles();

  return (
    <div className={classes.overflow}>
      <div className={`${classes.ellipsis} ${classes.title}`}>{title}</div>
      <div className={`${classes.ellipsis} ${classes.subtitle}`}>
        {subtitle}
      </div>
    </div>
  );
}
