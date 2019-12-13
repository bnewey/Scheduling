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
      backgroundColor: '#ffedc4',
      boxShadow: "-10px 12px 10px -5px rgba(0,0,0,0.45), 0px 0px 1px 0px rgba(0,0,0,0.14), 0px 0px 1px -1px rgba(0,0,0,0.12)"
    },
    h1: {
      alignSelf: 'center',
      marginLeft: '10px',
      color: '#6c4100',
      textTransform:'uppercase' ,
      fontFamily: 'Helvetica'

    },
    imageWrapper: {
      width: 'auto',
      padding: '5px 10px 5px 10px',
      backgroundColor: '#dfdfdf',
      borderRadius: '99px',
      border: '3px solid #fff',
      margin: '5px 0px 5px 0px',
      
    },
    image: {
      minWidth: '50px'
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

