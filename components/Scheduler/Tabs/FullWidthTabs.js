import React, {useRef, useState, useEffect, createContext} from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import {AppBar, Tabs, Tab, Typography, Box} from '@material-ui/core';

import TaskIcon from '@material-ui/icons/Assignment';
import MapIcon from '@material-ui/icons/Map';
import ViewListIcon from '@material-ui/icons/ViewList';
import CrewIcon from '@material-ui/icons/Group';

function TabPanel(props) {
  const {classes, children, tabValue, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={tabValue !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {tabValue === index && <Box className={classes.tab_box} p={2}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  tabValue: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}



export default function FullWidthTabs({children, tabValue, setTabValue, numSelected, activeTask}) {
  const classes = useStyles();
  const theme = useTheme();

  //Save and/or Fetch tabValue to local storage
  useEffect(() => {
    if(tabValue == null){
      var tmp = window.localStorage.getItem('tabValue');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(!isNaN(tmpParsed) || tmpParsed == null){
        if(tmpParsed > 3 || tmpParsed < 0){
          console.error("Bad tabValue in localstorage");
        }
        setTabValue(tmpParsed);
      }else{
        setTabValue(0);
      }
    }
    if(!isNaN(tabValue)){
      window.localStorage.setItem('tabValue', JSON.stringify(tabValue ? tabValue : 0));
    }
    
  }, [tabValue]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangeIndex = index => {
    setTabValue(index);
  };

  if(tabValue == null){
    return(<></>);
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          tabValue={tabValue}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
          className={classes.tabRoot}
        >
          <Tab className={tabValue === 0 ? classes.selectedTab : classes.nonSelectedTab} 
              label={ 
                <React.Fragment>
                  <span  className={classes.tabSpan}>
                    <TaskIcon className={ classes.icon}/>
                    <Box display={{ xs: 'none', md: 'inline' }}  component="span">Scheduler</Box>
                  </span>
                  {/* {activeTask ? 
                    <p className={classes.p_selected}>
                        Active: {activeTask.list_name} {activeTask.is_priority ? "(PRIORITY)" : ""}
                    </p> : <></>
                  } */}
              </React.Fragment>} {...a11yProps(0)} />
          <Tab className={tabValue === 1 ? classes.selectedTabSmall : classes.nonSelectedTabSmall} 
                    label={ <span className={classes.tabSpan}>
                                <MapIcon className={classes.icon}/>
                                    <Box display={{ xs: 'none', md: 'inline' }}  component="span">Map</Box>
                            </span>} {...a11yProps(1)} />
          <Tab className={tabValue === 2 ? classes.selectedTabSmall : classes.nonSelectedTabSmall} 
              label={ <span  className={classes.tabSpan}>
                                <CrewIcon className={classes.icon}/>
                                <Box display={{ xs: 'none', md: 'inline' }}  component="span">Crew</Box>
                            </span>} {...a11yProps(2)} />
          
          <Tab className={tabValue === 3 ? classes.selectedTabSmall : classes.nonSelectedTabSmall} 
              label={ <React.Fragment>
                          <span className={classes.tabSpan}> 
                            <ViewListIcon className={classes.icon}/>
                            <Box display={{ xs: 'none', md: 'inline' }}  component="span">All Tasks</Box>
                          </span>
                          {/* {numSelected ? <p className={classes.p_selected}>
                            {numSelected} Selected {activeTask ? "" : "(UNSAVED)"}
                          </p> : <></>} */}
                          </React.Fragment>} {...a11yProps(3)} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={tabValue}
        onChangeIndex={handleChangeIndex}
        className={classes.tabRoot}
        disabled={true}
      >
     
         {children.map((child, index) => (   <TabPanel className={classes.tab} classes={classes}  key={index} tabValue={tabValue} index={index} dir={theme.direction}>
            {child}
          </TabPanel>
         ))}
       
  
      </SwipeableViews>
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  //[theme.breakpoints.down('sm')]: sm, md, lg
  root: {
    width: '100%',
    '& header':{
      marginBottom: '1%',
    },
  },
  icon:{
      margin: '2px 6px -3px 6px',
      color: '#a0a0a0',
  },
  tabSpan: {
    fontSize: '16px',
    fontWeight: '500',
  },
  selectedTab: {
    flexGrow : '2',
    boxShadow: 'inset 1px 2px 6px 0px #414d5a',
    color: '#d87904 !important',
    backgroundColor: '#ffedc4',
    padding: '10px',
    minHeight: '0px',
    lineHeight: '1',
  },
  nonSelectedTab: {
    flexGrow : '2',
    boxShadow:' -1px 1px 2px 0px #414d5a',
    
    '&:hover':{
      backgroundColor: '#fff',
      borderTop: '2px solid #a2ceff',
      borderBottom: '2px solid #a2ceff',
      color: '#d87904',
    },
    minHeight: '0px',
    lineHeight: '1',
  },
  selectedTabSmall: {
    flexGrow : '1',
    boxShadow: 'inset 1px 2px 6px 0px #414d5a',
    color: '#d87904 !important',
    backgroundColor: '#ffedc4',
    padding: '10px',
    minHeight: '0px',
    lineHeight: '1',
  },
  nonSelectedTabSmall: {
    boxShadow:' -1px 1px 2px 0px #414d5a',
    flexGrow : '1',
    '&:hover':{
      backgroundColor: '#fff',
      borderTop: '2px solid #a2ceff',
      borderBottom: '2px solid #a2ceff',
      color: '#d87904',
    },
    minHeight: '0px',
    lineHeight: '1',
  },
  tab:{
    backgroundColor: '#5b6164',
    boxShadow: 'inset 0 0 4px 4px #0000006b',
    border: '1px solid #7f7f7f',
    
  },
  tabRoot:{
    minHeight: '0px',
  },
  p_selected:{
    margin: '0px 0px',
    padding: '0px 10px',
    position: 'absolute',
    bottom: '.75em',
    color: 'rgb(255, 237, 196)',
    fontSize: '12px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    width: '75%',
    backgroundColor: '#65aea4',
    borderRadius: '2px',
    boxShadow: 'inset 0px 1px 5px 0px rgba(0,0,0,0.2)',
  },
  test:{
    padding: '10px',
  },
  tab_box:{
    padding: '.5%',
    overflow: 'hidden',
  }
}));