import React, {useRef, useState, useEffect} from 'react';
import { lighten, makeStyles } from '@material-ui/core/styles';
import {Typography, Toolbar, Button} from '@material-ui/core';
import PropTypes from 'prop-types';
import clsx from 'clsx';
  
const WorkOrderTableToolbar = props => {
  const classes = useToolbarStyles();
  const { numSelected, tabValue, setTabValue, numPdfRows } = props;

  //METHODS
  const handleTabChange = (event, value) => { 
      setTabValue(value);
  }

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1">
          {numPdfRows} Selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle">
          Work Orders - {numPdfRows} Selected
        </Typography>
      )}
              <Button
          onClick={event => handleTabChange(event, 1)}             
          variant="text"
          color="secondary"
          size="medium"
          className={`${classes.darkButton} ${classes.borderButton}`}
          
      > Create a PDF
      </Button>
    </Toolbar>
  );
};

WorkOrderTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default WorkOrderTableToolbar;


const useToolbarStyles = makeStyles(theme => ({
  root: {
    padding: '0px 15px',
    minHeight: '24px',
    backgroundColor: '#16233b',
    color: '#fff',
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
    margin: '7px 0px 0px 0px',

    fontSize: '30px !important',
  },
  darkButton:{
      backgroundColor: '#fca437',
      color: '#fff',
      fontWeight: '600',
      fontSize: '20px',
      minWidth: '10%',
      padding: '1px 3px',
  },
  borderButton:{
    border: '1px solid rgb(255, 237, 196)',
    '&:hover':{
      border: '',
      backgroundColor: '#ffedc4',
      color: '#d87b04'
    }
  }
}));