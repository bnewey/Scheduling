import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress} from '@material-ui/core';

import EnhancedTable from './EnhancedTable';
import TaskListContainer from '../TaskList/TaskListContainer.js';
import MapContainer from '../Map/MapContainer';

import FullWidthTabs from '../Tabs/FullWidthTabs';
import Tasks from '../../../js/Tasks';
import TaskLists from '../../../js/TaskLists';

import cogoToast from 'cogo-toast';

import Util from  '../../../js/Util';

var today =  new Date();

export const TaskContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const TaskContainer = function() {
  const [rows, setRows] = useState();
  const [rowDateRange, setDateRowRange] = useState({
          from: Util.convertISODateToMySqlDate(today),
          to: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-90)))
        });
  const [taskLists, setTaskLists] = useState();
  const [mapRows, setMapRows] = useState([]); //setMapRows gets called in children components
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterConfig, setFilterConfig] = useState();
  const [tabValue, setTabValue] = React.useState(0);
  const [taskListToMap, setTaskListToMap] = useState(null);
  
  const classes = useStyles();
  
  useEffect( () =>{ //useEffect for inputText
    //Gets data only on initial component mount or when rows is set to null
    if(!rows || rows == []) {
      Tasks.getAllTasks()
      .then( (data) => {
        setRows(data);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting tasks`);
      })
    }

    //This runs if rows is refetched...
    //check if mapRows already exists, if so we need to update that with new rows
    if(rows){
      if(mapRows || mapRows != []){
        var tmpMapRows = rows.filter((row, i)=>{
          if(selectedIds.indexOf(row.t_id) != -1){
            return true;
          }
          return false;
        })
        setMapRows(tmpMapRows);
      }
    }
  
    return () => { //clean up
        if(rows){
            
        }
    }
  },[rows]);

  useEffect( () =>{ //useEffect for inputText
    //Gets data only on initial component mount
    if(!taskLists || taskLists == []) {
      TaskLists.getAllTaskLists()
      .then( (data) => setTaskLists(data))
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting tasklists`);
      })
    }
  
    return () => { //clean up
        if(taskLists){
            
        }
    }
  },[ taskLists]);

  

  return (
    <div className={classes.root}>
      <TaskContext.Provider value={{taskLists,setTaskLists, mapRows, setMapRows, selectedIds, setSelectedIds, 
                            tabValue, setTabValue, taskListToMap, setTaskListToMap, setRows}} >
        <FullWidthTabs value={tabValue} setValue={setTabValue} 
                      numSelected={selectedIds.length} activeTaskName={taskListToMap ? taskListToMap.list_name : null}>
        
          <div>
            <TaskListContainer />
          </div>
          
          <div>
            <EnhancedTable rows={rows} filterConfig={filterConfig} setFilterConfig={setFilterConfig}/>
          </div> 
        
          <div style={{minHeight: '600px'}}>
            <MapContainer />
          </div>

        </FullWidthTabs>
      </TaskContext.Provider>
    </div>
  );
}

export default TaskContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '25px 0px 0px 0px',
  },
}));