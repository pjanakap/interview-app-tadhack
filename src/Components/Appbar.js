import { AppBar, makeStyles, Toolbar, Typography } from '@material-ui/core';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { CandiateDetails } from '../Config';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#F1F5F8',
    height: '100vh',
    textAlign: 'center',
  },
  text: {
    fontSize: '22px',
    color: '#314b9f',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '15px',
    letterSpacing: '0px',
    opacity: 1,
    height: '28px',
  },
  join: {
    background: '#3087EC',
    color: 'white',
    '&:hover': {
      backgroundColor: '#3087EC',
      color: 'white',
    },
  },
}));

const Appbar = () => {
  const classes = useStyles();
  const { pathname } = useLocation();
  return (
    <AppBar position="static" color="transparent">
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography className={classes.text}>Interview Room</Typography>
        {pathname === '/call' && <Typography>Interviewing candidate: {CandiateDetails.CandiateName}</Typography>}
      </Toolbar>
    </AppBar>
  );
};

export default Appbar;
