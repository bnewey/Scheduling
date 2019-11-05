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

/*`
  padding: 15px;
  border-bottom: 1px solid #ddd;
  display: flex;
  background: #414d5a;
  a {
    padding: 0 15px;
    color: #FFF;
    &:hover {
      background: #414d5a;
      color: #c8dee4;
    }
  }
  
`*/

const Nav = () => {

  const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      background: '#414d5a',

    },
    a:{
      padding: '0 15px',
      color: '#FFF',
      '&$hover': {
        background: '#414d5a',
        color: '#c8dee4'
      } 
      
    },
    hover:{}
    
   
  }));

  //only works inside a functional component
  const classes = useStyles();

  return(
  <AppBar position="static" classes={{root: classes.root}}>
    <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Link href="/"><a className={classes.a} >DEV</a></Link>
          <Link href='/'><a className={classes.a}>Home</a></Link> |
          <Link href='/machineData' prefetch><a className={classes.a}>MachineData</a></Link>
        </Toolbar>    
  </AppBar>
  )
}

export default Nav