import React from "react";
import { makeStyles } from '@material-ui/core/styles';


const StyledFooter = (props) => {
  const useStyles = makeStyles(theme => ({
    root: {
      padding: '15px',
      background: '#414d5a',
      color: '#f5f5f5',
    },
  }));

  const classes = useStyles();

  return(<div className={classes.root}>Rainey Electronics - Scheduling</div>);

}

export default StyledFooter