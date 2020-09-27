import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

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

export default ({ target }) => {
  const classes = useStyles();
  const { contentRating, name } = target.attributes;
  if (contentRating === undefined) {
    return name;
  }

  return (
    <div className={classes.root}>
      {name}
      <Avatar className={classes.avatar}>
        {contentRating[0].toUpperCase()}
      </Avatar>
    </div>
  );
};
