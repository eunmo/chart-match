import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: 'none',
  },
}));

export default ({ to, children }) => {
  const classes = useStyles();

  return (
    <Link
      to={to}
      component={RouterLink}
      color="inherit"
      className={classes.link}
    >
      {children}
    </Link>
  );
};
