import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, CircularProgress, Grid, IconButton,TextField,InputBase, Select, MenuItem} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Grow from '@material-ui/core/Grow';
import Slide from '@material-ui/core/Slide';
import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';
import Work_Orders from  '../../../js/Work_Orders';
import { ListContext } from '../EntitiesContainer';

import Search from './Components/Search';

import dynamic from 'next/dynamic'
const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
  ssr: false
});

const EntityToolbar = function(props) {
  const {user} = props;

  
  const { entities, setEntities,
    currentView, setCurrentView, views, detailEntityId,setDetailEntityId, activeEntity, setActiveEntity,
    editEntModalOpen, setEditEntModalOpen, raineyUsers, setRaineyUsers, setEditModalMode, recentEntities,
     setRecentEntities, entitiesRefetch, setEntitiesRefetch} = useContext(ListContext);

  const backMode = currentView && currentView.value != "allEntities";

  const classes = useStyles({backMode});
  
  
  const toolBarMainGrid = () =>{
    switch(currentView.value){
      case "allEntities":
        return <Search />
        break
      case "search":
        return <Search />
        break;
      case "entityDetail":
      case "entAddresses":
      case "entContacts":
        return (<Grid item className={classes.woDetailToolbarDiv} xs={ 5}>
                  <span className={classes.woLabelSpan}>WO#:{detailEntityId}</span><span className={classes.woLabelSpan}>{activeEntity && activeEntity.c_name}</span>
                </Grid>);
        break;
      
        
      default: 
        cogoToast.error("Bad view");
        return <></>;
        break;
    }
  }

  const toolBarLeftGrid = ()=>{
    const handleCloseView = (view)=>{
    
      setCurrentView(views.find((view)=> view.value == currentView.closeToView));
      //Run onClose and onClose of parent page in case it is child
      if(view.onClose){
        view.onClose();
      }
      if(view.parent){
        var parent_view = views.find((v)=> v.value == view.parent);
        if(parent_view?.onClose){
          parent_view.onClose()
        }
      }
    }


    if(backMode){
      return(
        <Slide direction="left" in={currentView.value} mountOnEnter unmountOnExit>
        <Grid item xs={2} className={classes.toolbarLeftGrid}>
            <IconButton type="submit" className={classes.backIconButton}  size="medium" aria-label="close_search" onClick={event=> handleCloseView(currentView )}>
                  <ArrowBackIcon className={classes.backIcon} />
            </IconButton>
            <span className={classes.toolbarLeftGridHeadSpan}>{currentView.displayName}</span>
        </Grid>
        </Slide>
      );
    }
    //Default
    return(
      <Grid item xs={2} className={classes.toolbarLeftGridPlain}>
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
            <Grid item xs={backMode ? 5: 5}></Grid>
            
        </Grid>
  );
}

export default EntityToolbar

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
  toolbarLeftGridHeadSpan:{
    fontFamily: 'sans-serif',
    fontSize: '21px',
    color: '#4e4e4e',
    margin: '0px 10px 0px 10px'
  },
  backIcon:{
    fontSize: '30px',
    color: '#ce6a00',
    
  },
  backIconButton:{
    padding: '9px',
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