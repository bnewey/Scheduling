import React from "react";
import { makeStyles } from '@material-ui/core/styles';


const StyledFooter = (props) => {
  const useStyles = makeStyles(theme => ({
    root: {
      padding: '15px',
      background: '#5b7087',
      color: '#f5f5f5',
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '-webkit-fill-available',
      marginBottom: '0px',
      boxShadow: 'inset 0px 4px 4px #434d59',
    },
  }));

  const classes = useStyles();

  return(<div className={classes.root}>Rainey Electronics - Scheduling</div>);

}

export default StyledFooter