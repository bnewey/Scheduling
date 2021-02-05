import React, {useRef, useState, useEffect, createContext} from 'react';
import {makeStyles, CircularProgress} from '@material-ui/core';

import EnhancedTable from './Table/EnhancedTable';
import TaskListContainer from './TaskList/TaskListContainer.js';
import MapContainer from './Map/MapContainer';
import CrewContextContainer from './Crew/CrewContextContainer';
import CrewContainer from './Crew/CrewContainer/CrewContainer';
import FullWidthTabs from './Tabs/FullWidthTabs';
import Tasks from '../../js/Tasks';
import TaskLists from '../../js/TaskLists';
import TaskModal from './TaskModal/TaskModal';

import cogoToast from 'cogo-toast';

import Util from  '../../js/Util';
import HelpModal from './HelpModal/HelpModal';
import CalendarContainer from './Calendar/CalendarContainer';


var today =  new Date();

export const TaskContext = createContext(null);

//This is the highest component for the Task Page
//Contains all important props that all tabs use
const TaskContainer = function(props) {
  const {user} = props;

  const [rows, setRows] = useState();
  const [rowDateRange, setDateRowRange] = useState({
          from: Util.convertISODateToMySqlDate(today),
          to: Util.convertISODateToMySqlDate(new Date(new Date().setDate(today.getDate()-90)))
        });
  const [tabValue, setTabValue] = React.useState(null);

  //TaskList/Scheduler Props
    //TaskListTasks is in TaskListMain
    const [tableInfo ,setTableInfo] = useState(null);
    const [taskListTasksSaved, setTaskListTasksSaved] = useState([]);
    const [taskLists, setTaskLists] = useState();
    const [priorityList, setPriorityList] = useState(null);
    const [filters, setFilters] = useState(null);
    const [filterInOrOut, setFilterInOrOut] = useState(null);
    const [filterAndOr, setFilterAndOr] = useState(null);
    const [sorters, setSorters] = useState(null);

  //Map Props
    const [taskListToMap, setTaskListToMap] = useState(null);
    const [crewToMap, setCrewToMap] = useState(null);
    //map rows is in MapContainer
  //Table Props
    const [selectedIds, setSelectedIds] = useState([]);
    const [filterConfig, setFilterConfig] = useState();
    const [filterSelectedOnly, setFilterSelectedOnly] = React.useState(false);
    const [filterScoreboardsAndSignsOnly, setFilterScoreboardsAndSignsOnly] = React.useState(false);
  //Modal Props
  const [modalOpen, setModalOpen] = React.useState(false);  
  const [modalTaskId, setModalTaskId] = React.useState();  
  
  const classes = useStyles();
  
  const [refreshView, setRefreshView] = React.useState(null);

  useEffect(()=>{
    //This is to refresh view for taskModal after making changes
    //, when we dont have direct access to state that needs to be refetched
    if(refreshView){
      // switch(refreshView){
      //   case 'calendar':
      //     break;
      //   case 'taskList':
      //     break;
      //   case 'map':
      //     break;
      //   case 'crew':
      //     break;
      //   case 'allTasks':
      //     break;
      // } 
      setRefreshView(null);
    }
  },[refreshView])

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
    if(taskListToMap == null && taskLists && taskLists.length > 0){
      //Hard coded in our tasklist
      setTaskListToMap(taskLists.filter((tl,i)=> tl.is_priority == 1 )[0]);
    }
  },[taskListToMap, taskLists]);


  //Save and/or Fetch filters to local storage
  useEffect(() => {
    if(filters == null){
      var tmp = window.localStorage.getItem('filters');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setFilters(tmpParsed);
      }else{
        setFilters([]);
      }
    }
    if(Array.isArray(filters)){
      window.localStorage.setItem('filters', JSON.stringify(filters));
    }
    
  }, [filters]);

  
  //Save and/or Fetch tabValue to local storage
  useEffect(() => {
    if(tabValue == null){
      var tmp = window.localStorage.getItem('tabValue');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(!isNaN(tmpParsed) && tmpParsed != null){
        if(tmpParsed > 3 || tmpParsed < 0){
          console.error("Bad tabValue in localstorage");
        }
        setTabValue(tmpParsed);
      }else{
        setTabValue(0);
      }
    }
    if(!isNaN(tabValue) && tabValue != null){
      window.localStorage.setItem('tabValue', JSON.stringify(tabValue ? tabValue : 0));
    }
    
  }, [tabValue]);
  

  
  

  return (
    <div className={classes.root}>
      <TaskContext.Provider value={{taskLists,setTaskLists,priorityList,setPriorityList, selectedIds, setSelectedIds, 
                            tabValue, setTabValue, taskListToMap, setTaskListToMap, crewToMap, setCrewToMap, setRows, filterSelectedOnly, setFilterSelectedOnly,
                            filterScoreboardsAndSignsOnly, setFilterScoreboardsAndSignsOnly,tableInfo ,setTableInfo,
                            modalOpen, setModalOpen, modalTaskId, setModalTaskId, filters, setFilters,filterInOrOut, setFilterInOrOut, filterAndOr, setFilterAndOr,
                             sorters, setSorters, taskListTasksSaved, setTaskListTasksSaved, user, refreshView, setRefreshView} } >
      <CrewContextContainer tabValue={tabValue}/* includes crew context */>
          <FullWidthTabs tabValue={tabValue } setTabValue={setTabValue} 
                        numSelected={selectedIds.length} activeTask={taskListToMap ? taskListToMap : null}  >
            <div>
                 <CalendarContainer />
            </div>
            <div >
              <TaskListContainer />
            </div>

            <div style={{minHeight: '600px'}}>
              <MapContainer user={user}/>
            </div>

            <div>
              <CrewContainer />
            </div> 

            <div>
              <EnhancedTable rows={rows} setRows={setRows} filterConfig={filterConfig} setFilterConfig={setFilterConfig}/>
            </div> 
          
          

          </FullWidthTabs>
        
        
        <TaskModal modalOpen={modalOpen} setModalOpen={setModalOpen} 
                  modalTaskId={modalTaskId} setModalTaskId={setModalTaskId} />
      
      
        {/* HelpModal initialPage={"tasks"} initialTab={tabValue} />*/}

        </CrewContextContainer>
      </TaskContext.Provider>
    </div>
  );
}

export default TaskContainer

const useStyles = makeStyles(theme => ({
  root:{
    margin: '0',
  },
  test:{
    padding: '10px',
  }
}));