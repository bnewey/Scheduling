import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress} from '@material-ui/core';

import EnhancedTable from './Table/EnhancedTable';
import TaskListContainer from './TaskList/TaskListContainer.js';
import MapContainer from './Map/MapContainer';
import CrewContainer from './Crew/CrewContainer';

import FullWidthTabs from './Tabs/FullWidthTabs';
import Tasks from '../../js/Tasks';
import TaskLists from '../../js/TaskLists';
import TaskModal from './TaskModal/TaskModal';

import cogoToast from 'cogo-toast';

import Util from  '../../js/Util';
import HelpModal from './HelpModal/HelpModal';

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
  const [priorityList, setPriorityList] = useState(null);
  const [mapRows, setMapRows] = useState([]); //setMapRows gets called in children components
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterConfig, setFilterConfig] = useState();
  const [tabValue, setTabValue] = React.useState(0);
  const [taskListToMap, setTaskListToMap] = useState(null);
  const [filterSelectedOnly, setFilterSelectedOnly] = React.useState(false);
  const [filterScoreboardsAndSignsOnly, setFilterScoreboardsAndSignsOnly] = React.useState(false);
  //Modal Props
  const [modalOpen, setModalOpen] = React.useState(false);  
  const [modalTaskId, setModalTaskId] = React.useState();  
  
  const classes = useStyles();

  //Tasks/MapRows
  useEffect( () =>{
    //Gets data only on initial component mount or when rows is set to null
    if(!rows || rows == []) {
      Tasks.getAllTasks()
      .then( data => { setRows(data); })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting tasks`, {hideAfter: 4});
      })
    }

    //This runs if rows is refetched...
    //check if mapRows already exists, if so we need to update that with new rows
    if(rows){
      if(mapRows || mapRows != []){
        var tmpMapRows = rows.filter((row, i)=>{
          if(selectedIds.indexOf(row.t_id) != -1) 
            return true;
          return false;
        })
        setMapRows(tmpMapRows);
      }
    }
  },[rows]);

  //TaskLists
  useEffect( () =>{ 
    //Gets data only on initial component mount
    if(!taskLists || taskLists == []) {
      TaskLists.getAllTaskLists()
      .then( (data) => {
        setTaskLists(data);
        //set priorityList
        setPriorityList(data.filter((list, i)=> list.is_priority == true)[0]);
      })
      .catch( error => {
        console.warn(error);
        cogoToast.error(`Error getting tasklists`, {hideAfter: 4});
      })
    }
  },[ taskLists]);

  //TaskListToMap
  useEffect( () =>{ 
    //Gets and sets tasks from Task List when theres a tasklistToMap and no selected from EnhancedTable
    if(taskListToMap) {
        TaskLists.getTaskList(taskListToMap.id)
        .then( (data) => {
            //Set selected ids to Task List Tasks to prevent confusing on Tasks Table
            var newSelectedIds = data.map((item, i )=> item.t_id );
            setSelectedIds(newSelectedIds);
            
            setMapRows(data);
            cogoToast.success(`Active Task List: ${taskListToMap.list_name}.`, {hideAfter: 4});
        })
        .catch( error => {
            console.error(error);
            cogoToast.error(`Error getting task list`, {hideAfter: 4});
        })        
    }
    },[taskListToMap]);




  

  return (
    <div className={classes.root}>
      <TaskContext.Provider value={{taskLists,setTaskLists,priorityList,setPriorityList, mapRows, setMapRows, selectedIds, setSelectedIds, 
                            tabValue, setTabValue, taskListToMap, setTaskListToMap, setRows, filterSelectedOnly, setFilterSelectedOnly,
                            filterScoreboardsAndSignsOnly, setFilterScoreboardsAndSignsOnly,
                            modalOpen, setModalOpen, modalTaskId, setModalTaskId} } >
        <FullWidthTabs value={tabValue} setValue={setTabValue} 
                      numSelected={selectedIds.length} activeTask={taskListToMap ? taskListToMap : null}>
        
          <div>
            <CrewContainer>
              <TaskListContainer />
            </CrewContainer>
          </div>
          
          <div>
            <EnhancedTable rows={rows} setRows={setRows} filterConfig={filterConfig} setFilterConfig={setFilterConfig}/>
          </div> 
        
          <div style={{minHeight: '600px'}}>
            <MapContainer />
          </div>

        </FullWidthTabs>
        
        <CrewContainer>
              <TaskModal modalOpen={modalOpen} setModalOpen={setModalOpen} 
                        modalTaskId={modalTaskId} setModalTaskId={setModalTaskId}/>
        </CrewContainer>
        
        <HelpModal initialPage={"tasks"} initialTab={tabValue} />

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