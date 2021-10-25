import React, { useContext} from 'react';
import {makeStyles, Grid} from '@material-ui/core';


import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';
import { AdminContext } from '../AdminContainer';


import dynamic from 'next/dynamic'
import clsx from 'clsx';


const AdminToolbar = function(props) {
  const {user} = props;

  
  const { currentView, previousView, handleSetView, views} = useContext(AdminContext);

  const classes = useStyles();
  
  
  const toolBarMainGrid = () =>{
    switch(currentView.value){
      case "users":
        return (<Grid item className={classes.woDetailToolbarDiv} xs={ 7} md={5}>
                  <span className={classes.woLabelSpan}>{currentView.displayName}</span>
                </Grid>);
        break;
      default: 
        cogoToast.error("Bad view");
        return <></>;
        break;
    }
  }

  const toolBarLeftGrid = ()=>{

    //Default
    return(
      <Grid item xs={6} md={2} className={classes.toolbarLeftGridPlain}>
            <img src="/static/rainey_elec.png" height='30'/>
            <span className={classes.toolbarLeftGridHeadSpan}>{currentView.displayName}</span>
      </Grid>
    );
  }

  return (
        <Grid container className={classes.root} >
            {/* xs={2}*/}
            {toolBarLeftGrid()} 
            {/* xs={5}*/}
            {toolBarMainGrid()}
            <Grid item xs={5}></Grid>
            
        </Grid>
  );
}

export default AdminToolbar

const useStyles = makeStyles(theme => ({
  root:{
      display: 'flex',
      flexDirection: 'row',
      // border: '1px solid #333399',
      // padding: '.2% 1%',
      background: 'linear-gradient(0deg, #f1f1f1, white)',
      boxShadow: '0px 3px 4px 0px #dcdcdc',
      border: '1px solid #d6d6d6',
  },
  toolbarLeftGrid:{
    background: 'linear-gradient(0deg, #e0a36f7d, #f7d29d73)',
    margin: '0px 5px 0px 0px',
    boxShadow: 'inset -3px 0px 4px 0px #d3ac83',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '56px',
  },
  toolbarLeftGridPlain:{
    margin: '0px 5px 0px 0px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    //padding: '7px 7px',
    minHeight: '56px',
  },
  backContainer:{
    cursor: 'pointer',
    '&:hover':{
      textDecoration: 'underline',
    },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarLeftGridHeadSpan:{
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '21px',
    },
    fontFamily: 'sans-serif',
    
    color: '#4e4e4e',
    margin: '0px 10px 0px 10px'
  },
  woDetailToolbarDiv:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    fontSize: '15px',
  },
  woLabelSpan:{
    fontWeight: '600',
    fontFamilt: 'sans-serif',
    color: '#777',
    marginLeft: '20px',
  }

}));