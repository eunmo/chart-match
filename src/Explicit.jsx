import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Avatar from '@mui/material/Avatar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginLeft: theme.spacing(1),
    fontSize: '1em',
  },
}));

export default function Explicit({ target }) {
  const classes = useStyles();
  const { contentRating, name } = target.attributes;
  if (contentRating === undefined) {
    return name;
  }

  return (
    <div className={classes.root}>
      <Avatar className={classes.avatar}>
        {contentRating[0].toUpperCase()}
      </Avatar>
    </div>
  );
}
