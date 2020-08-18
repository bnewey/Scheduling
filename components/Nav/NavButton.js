import React from "react";
import Link from "next/link";

import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from "next/router";

const NavButton = props => {
  const {sizeStyle} = props;

  const useStyles = makeStyles(theme => ({
    a:{  
      cursor: 'pointer',    
      display: 'block',
      fontSize: 'small',
      fontWeight: '600',
      padding: '10px 10px 10px 10px',
      margin: '0px 0px 0px 10px',
      minWidth: '100px',
      textDecoration: 'none',
      textAlign: 'center',
      fontFamily: 'Helvetica',
      color: '#FFF',
      border: '1px solid #99aec5',
      borderRadius: '2px',
      backgroundColor: '#9e9e9e6b',
      "&:hover, &:focus": {
        backgroundColor: '#9e9e9e',
        border: '1px solid #bdf0ff',
      },
      
    },
    hover:{},
    active:{
      border: '1px solid #bdf0ff',
      backgroundColor: '#9e9e9e',
      textDecoration: 'underline',
    }
  }));

  const classes = useStyles();

  return (
      <Link display={{ xs: 'none', md: 'block' }} href={props.path} as={`/scheduling/${props.path}`}><div className={`NavButton ${
        props.router.pathname === props.path ? "active" : ""
      }`}>
          <a className={classes.a + " " + (props.router.pathname === props.path ? classes.active : "") } >{props.label} </a></div>
      </Link>
  );
}

export default withRouter(NavButton);