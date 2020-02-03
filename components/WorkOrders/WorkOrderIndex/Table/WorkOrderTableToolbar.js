import React, {useRef, useState, useEffect} from 'react';
import { lighten, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';



  
  const WorkOrderTableToolbar = props => {
    const classes = useToolbarStyles();
    const { numSelected } = props;

    
  
    return (
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        {numSelected > 0 ? (
          <Typography className={classes.title} color="inherit" variant="subtitle1">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography className={classes.title} variant="h6" id="tableTitle">
            Work Orders
          </Typography>
        )}
               
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
  }));