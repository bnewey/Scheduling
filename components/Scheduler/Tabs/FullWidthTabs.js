import React from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import {AppBar, Tabs, Tab, Typography, Box} from '@material-ui/core';

import TaskIcon from '@material-ui/icons/Assignment';
import MapIcon from '@material-ui/icons/Map';
import ViewListIcon from '@material-ui/icons/ViewList';
import CrewIcon from '@material-ui/icons/Group';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={2}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}



export default function FullWidthTabs({children, value, setValue, numSelected, activeTask}) {
  const classes = useStyles();
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = index => {
    setValue(index);
  };

  if(value == null){
    return(<></>);
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
          className={classes.tabRoot}
        >
          <Tab className={value === 0 ? classes.selectedTab : classes.nonSelectedTab} 
              label={ 
                <React.Fragment>
                  <span className={classes.tabSpan}>
                    <TaskIcon className={ classes.icon}/>&nbsp;Scheduler
                  </span>
                  {/* {activeTask ? 
                    <p className={classes.p_selected}>
                        Active: {activeTask.list_name} {activeTask.is_priority ? "(PRIORITY)" : ""}
                    </p> : <></>
                  } */}
              </React.Fragment>} {...a11yProps(0)} />
          <Tab className={value === 1 ? classes.selectedTabSmall : classes.nonSelectedTabSmall} label={ <span className={classes.tabSpan}><MapIcon className={classes.icon}/>&nbsp;Map</span>} {...a11yProps(1)} />
          <Tab className={value === 2 ? classes.selectedTabSmall : classes.nonSelectedTabSmall} label={ <span className={classes.tabSpan}><CrewIcon className={classes.icon}/>&nbsp;Crew</span>} {...a11yProps(2)} />
          
          <Tab className={value === 3 ? classes.selectedTabSmall : classes.nonSelectedTabSmall} 
              label={ <React.Fragment>
                          <span className={classes.tabSpan}> 
                            <ViewListIcon className={classes.icon}/>&nbsp;All Tasks
                          </span>
                          {/* {numSelected ? <p className={classes.p_selected}>
                            {numSelected} Selected {activeTask ? "" : "(UNSAVED)"}
                          </p> : <></>} */}
                          </React.Fragment>} {...a11yProps(3)} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
        className={classes.tabRoot}
      >
     
         {children.map((child, index) => (   <TabPanel className={classes.tab} key={index} value={value} index={index} dir={theme.direction}>
            {child}
          </TabPanel>
         ))}
       
  
      </SwipeableViews>
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    '& header':{
      marginBottom: '20px',
    },
  },
  icon:{
      margin: '2px 6px -3px 6px',
      color: '#a0a0a0',
  },
  tabSpan: {
    fontSize: '19px',
    fontWeight: '500',
  },
  selectedTab: {
    flexGrow : '2',
    boxShadow: 'inset 1px 2px 6px 0px #414d5a',
    color: '#d87904 !important',
    backgroundColor: '#ffedc4',
    padding: '10px'
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
  },
  selectedTabSmall: {
    flexGrow : '1',
    boxShadow: 'inset 1px 2px 6px 0px #414d5a',
    color: '#d87904 !important',
    backgroundColor: '#ffedc4',
    padding: '10px'
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
  },
  tab:{
    backgroundColor: '#5b6164',
    boxShadow: 'inset 0 0 4px 4px #0000006b',
    border: '1px solid #7f7f7f',
    
  },
  tabRoot:{

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
  }
}));