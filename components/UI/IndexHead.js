import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';

const IndexHead = ({children, image}) => {
  const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      width: 'auto',
      padding: '.2% 0% .2% 3%',
      margin: '1% 0% 1% 0%',
      backgroundColor: '#b2b2b2',
      boxShadow: "-10px 12px 10px -5px rgba(0,0,0,0.45), 0px 0px 1px 0px rgba(0,0,0,0.14), 0px 0px 1px -1px rgba(0,0,0,0.12)"
    },
    h1: {
      fontSize: '35px',
      padding: '10px 25px 5px 25px'

    },
    imageWrapper: {
      width: 'auto',
      
    },
    image: {
      maxWidth: '75px'
    }
  }));

  //only works inside a functional component
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
       <div className={classes.imageWrapper}><img src={image ? image : `static/sm_grey_box.png`} className={classes.image}/></div>
       <h1 className={classes.h1}>{children}</h1>
    </Paper>
  )
}
export default IndexHead;

