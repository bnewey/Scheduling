import React, {useRef, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';

import EnhancedTable from './EnhancedTable';
import TaskListContainer from '../TaskList/TaskListContainer.js';
import MapContainer from '../Map/MapContainer';

import FullWidthTabs from '../Tabs/FullWidthTabs';
import Tasks from '../../../js/Tasks';
import TaskLists from '../../../js/TaskLists';

import SnackBar from '../../UI/CustomSnackBar';

import Util from  '../../../js/Util';

var today =  new Date();

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
      
      //Custom Snackbar throughout Task Page
      const [snackBarStatus, setSnackBarStatusBase] = useState(null);
      const setSnackBarStatus = (msg, className, duration) => {
        setSnackBarStatusBase({ message: msg, className: className, autoHideDuration: duration });
      };

      const classes = useStyles();
      
      useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(!rows || rows == []) {
          Tasks.getAllTasks()
          .then( (data) => setRows(data))
          .catch( error => {
            console.warn(error);
          })
          
        }

        if(!taskLists || taskLists == []) {
          TaskLists.getAllTaskLists()
          .then( (data) => setTaskLists(data))
          .catch( error => {
            console.warn(error);
          })
          
        }
      
        return () => { //clean up
            if(rows){
                
            }
        }
      },[rows, taskLists]);

      

      return (
        <div className={classes.root}>
          {snackBarStatus ? <SnackBar key={new Date()} snackBarStatus={snackBarStatus} setSnackBarStatus={setSnackBarStatus} /> : null}
          <FullWidthTabs value={tabValue} setValue={setTabValue} 
            numSelected={selectedIds.length} activeTaskName={taskListToMap ? taskListToMap.list_name : null}>
          
          <div>
            <TaskListContainer 
                taskLists={taskLists} setTaskLists={setTaskLists}
                mapRows={mapRows} setMapRows={setMapRows}
                selectedIds={selectedIds} setSelectedIds={setSelectedIds} 
                tabValue={tabValue} setTabValue={setTabValue}
                taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap}
                snackBarStatus={snackBarStatus} setSnackBarStatus={setSnackBarStatus}
                  />
          </div>
          
         
          <div>
            <EnhancedTable 
              rows={rows} setRows={setRows}
              taskLists={taskLists} setTaskLists={setTaskLists}
              mapRows={mapRows}  setMapRows={setMapRows} 
              selectedIds={selectedIds} setSelectedIds={setSelectedIds} 
              filterConfig={filterConfig} setFilterConfig={setFilterConfig}
              tabValue={tabValue} setTabValue={setTabValue}
              taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap}
              snackBarStatus={snackBarStatus} setSnackBarStatus={setSnackBarStatus}/>
          </div> 
         
        <div style={{minHeight: '600px'}}>
          <MapContainer 
              taskLists={taskLists} setTaskLists={setTaskLists}
              mapRows={mapRows} setMapRows={setMapRows} 
              selectedIds={selectedIds} setSelectedIds={setSelectedIds}
              taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap}
              snackBarStatus={snackBarStatus} setSnackBarStatus={setSnackBarStatus}
          /></div>
        </FullWidthTabs>
        
        </div>
        
        
      );
    
}

export default TaskContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '25px 0px 0px 0px',
  },
}));