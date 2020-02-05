import React, {useRef, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';

import EnhancedTable from './EnhancedTable';
import TaskListContainer from '../TaskList/TaskListContainer.js';
import MapContainer from '../Map/MapContainer';

import FullWidthTabs from '../Tabs/FullWidthTabs';
import Tasks from '../../../js/Tasks';
import TaskLists from '../../../js/TaskLists';

import Util from  '../../../js/Util';

var today =  new Date();

//we can make this a functional component now
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

      const classes = useStyles();
      
      useEffect( () =>{ //useEffect for inputText
        //Gets data only on initial component mount
        if(!rows || rows == []) {
          console.log(rowDateRange);
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
          <FullWidthTabs value={tabValue} setValue={setTabValue}>
          
          <div>
            <TaskListContainer 
                        taskLists={taskLists} setTaskLists={setTaskLists}
                        mapRows={mapRows} setMapRows={setMapRows}
                        selectedIds={selectedIds} setSelectedIds={setSelectedIds} 
                        tabValue={tabValue} setTabValue={setTabValue}
                         />
          </div>
          
         
          <div>
            <EnhancedTable 
              rows={rows} setRows={setRows}
              taskLists={taskLists} setTaskLists={setTaskLists}
              mapRows={mapRows}  setMapRows={setMapRows} 
              selectedIds={selectedIds} setSelectedIds={setSelectedIds} 
              filterConfig={filterConfig} setFilterConfig={setFilterConfig}
              tabValue={tabValue} setTabValue={setTabValue}/>
          </div> 
         
        <div style={{minHeight: '600px'}}>
          <MapContainer 
              taskLists={taskLists} setTaskLists={setTaskLists}
              mapRows={mapRows} setMapRows={setMapRows} 
              selectedIds={selectedIds} setSelectedIds={setSelectedIds}
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