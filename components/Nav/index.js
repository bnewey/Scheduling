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
import {Box, Drawer,List,Divider,ListItem, ListItemIcon, ListItemText} from '@material-ui/core';

/*`
  display: flex;
  background: #414d5a;  
`*/

const Nav = (props) => {

  const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      background: '#5b7087',
    },
    toolbar: {
      minHeight: '48px',
    },
    button: {
      cursor: 'pointer',
      
    },
    list:{

    },
    listItem:{
      border: '1px solid #ececec',
      padding: '0% 20%'
    }
    
   
  }));

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleOpenDrawer = (event) =>{
    setDrawerOpen(true);
  }

  const closeDrawer = (event) =>{
    setDrawerOpen(false);
  }

  //only works inside a functional component
  const classes = useStyles();

  return(
  <AppBar position="static" classes={{root: classes.root}}>
    <Toolbar className={classes.toolbar}>
          <Box display={{ xs: 'inline', md: 'none' }}  component="span">
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={event=> handleOpenDrawer(event)}>
            <MenuIcon />
          </IconButton>
          <Drawer anchor={'left'} open={drawerOpen} onClose={event => closeDrawer(event)}>
            <List className={classes.list}>
                {props.navButtons.map(button => (
                  <ListItem className={classes.listItem}>
                      <Link href={button.path} as={`/scheduling/${button.path}`}><h3>{button.label}</h3></Link>
                  </ListItem>
                ))}
            </List>
          </Drawer>
          </Box>
          {props.navButtons.map(button => (
            <Box display={{ xs: 'none', md: 'inline' }}  component="span">
          <NavButton className={classes.button}
            key={button.path}
            path={button.path}
            label={button.label}
          /></Box>
          ))}
        </Toolbar>    
  </AppBar>
  )
}

export default Nav