import React from "react";
import Link from "next/link";

import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from "next/router";

const NavButton = props => {

  const useStyles = makeStyles(theme => ({
    a:{  
      cursor: 'pointer',    
      display: 'block',
      padding: '15px',
      textDecoration: 'none',
      color: '#FFF',
      backgroundColor: '#414d5a',
      "&:hover, &:focus": {
        backgroundColor: 'rgba(0, 0, 0, .18)',
      },
      
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