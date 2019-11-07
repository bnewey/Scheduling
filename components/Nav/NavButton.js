import React from "react";
import Link from "next/link";

import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from "next/router";

const NavButton = props => {

  const useStyles = makeStyles(theme => ({
    a:{
      padding: '0 15px',
      color: '#FFF',
      '&$hover': {
        background: '#6e90b154',
        color: '#c8dee4'
      } 
      
    },
    hover:{},
    active:{
      backgroundColor: '#6e90b154'
    }
  }));

  const classes = useStyles();

  return (
      <Link href={props.path}><div className={`NavButton ${
        props.router.pathname === props.path ? "active" : ""
      }`}>
          <a className={classes.a + " " + (props.router.pathname === props.path ? classes.active : "") } >{props.label} </a></div>
      </Link>
  );
}

export default withRouter(NavButton);