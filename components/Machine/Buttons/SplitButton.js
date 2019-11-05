import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { makeStyles } from '@material-ui/core/styles';
import { mergeClasses } from '@material-ui/styles';

import socketIOClient from 'socket.io-client';

export default function SplitButton({endpoint, name, options}) {
  //CSS 
  const useStyles = makeStyles(theme => ({
      root: {
        
      },
      button:{
        backgroundColor: '#932323',
        "&:hover, &:focus": {
          backgroundColor: '#5e0606'
        },
        borderColor: '#FFFFFF !important'
      },
      arrow:{
        backgroundColor: '#932323',
        "&:hover, &:focus": {
          backgroundColor: '#5e0606'
        }
        
      },
      a: {
        backgroundColor: '#932323'
      }
    })
  );

  const classes = useStyles();
  const classSelected = options[selectedIndex]; 
  /////

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  function handleClick() {
    const socket = socketIOClient(endpoint);

    options.forEach(function(item, index){
      if(options[selectedIndex] == item){
        socket.emit(item, name);
      }
    });

    alert(`You clicked ${options[selectedIndex]}. ${endpoint}`);
  }

  function handleMenuItemClick(event, index) {
    setSelectedIndex(index);
    setOpen(false);
  }

  function handleToggle() {
    setOpen(prevOpen => !prevOpen);
  }

  function handleClose(event) {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  }

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} align="center">
        <ButtonGroup variant="contained" color="primary" ref={anchorRef} aria-label="Split button">
          <Button className={classes.button} onClick={handleClick}>{options[selectedIndex]}</Button>
          <Button className={classes.arrow} 
            color="primary"
            variant="contained"
            size="small"
            aria-owns={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper id="menu-list-grow">
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList>
                    {options.map((option, index) => (
                      <MenuItem
                        key={option}
                        disabled=""
                        selected={index === selectedIndex}
                        onClick={event => handleMenuItemClick(event, index)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Grid>
    </Grid>
  );
}