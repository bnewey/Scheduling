import React, {useRef, useState, useEffect, useContext} from 'react';
import { lighten, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import {Typography, Toolbar, Button, Popper, Fade, Paper, ClickAwayListener} from '@material-ui/core';
import cogoToast from 'cogo-toast';

import {TaskContext} from './TaskContainer';


  
  const EnhancedTableToolbar = props => {
    //CSS
    const classes = useToolbarStyles();
    //PROPS
    const { numSelected, mapRowsLength} = props;
    const { tabValue, setTabValue} = useContext(TaskContext);
    //STATE
    const [anchorEl, setAnchorEl] = React.useState(null);
    
    //METHODS
    const handleTabChange = (event, value) => {
      if(mapRowsLength > 0){
        setTabValue(value);
      }else{
        cogoToast.info( 'Select a Task or Task List to view on the Map!', {hideAfter: 4});
      }

    }

    const handlePopperClickAway = () =>{
      setAnchorEl(null);
    }

    const open = Boolean(anchorEl);
    const id = open ? 'transitions-popper' : undefined;

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
            Scheduler
          </Typography>
          
        )}
        <Button
            onClick={event => handleTabChange(event, 2)}             
            variant="text"
            color="secondary"
            size="medium"
            className={`${classes.darkButton} ${classes.borderButton}`}
            
        > Map Tasks
        </Button>
        
        <Popper id={id} open={open} anchorEl={anchorEl} transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={10}>
              <ClickAwayListener onClickAway={handlePopperClickAway}>
              <Paper className={classes.popper}>Select some Tasks or Choose a Task List to view on the map.</Paper>
              </ClickAwayListener>
            </Fade>
          )}
        </Popper>
      </Toolbar>
    );
  };
  
  EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
  };


  export default EnhancedTableToolbar;

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