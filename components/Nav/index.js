import Link from 'next/link'
//import styled from 'styled-components'
//import { borderBottom } from '@material-ui/system';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import {withRouter} from "next/router";
import NavButton from '../Nav/NavButton';


/*`
  display: flex;
  background: #414d5a;  
`*/

const Nav = (props) => {

  const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      background: '#414d5a',

    },
    button: {
      cursor: 'pointer',
    }
    
   
  }));

  //only works inside a functional component
  const classes = useStyles();

  return(
  <AppBar position="static" classes={{root: classes.root}}>
    <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          {props.navButtons.map(button => (
          <NavButton className={classes.button}
            key={button.path}
            path={button.path}
            label={button.label}
          />
          ))}
        </Toolbar>    
  </AppBar>
  )
}

export default Nav