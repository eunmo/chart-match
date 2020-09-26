import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';

export default ({ to, children }) => (
  <Link to={to} component={RouterLink} color="inherit" underline="none">
    {children}
  </Link>
);
