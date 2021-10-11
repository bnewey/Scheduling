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
import Settings from '../../js/Settings';
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
    const [installDateFilters, setInstallDateFilters] = useState([]);
    const [drillDateFilters, setDrillDateFilters] = useState([])
    const [arrivalDateFilters, setArrivalDateFilters] = useState([]);
    const [activeTaskView,setActiveTaskView] = useState(null)
    const [savedFilters, setSavedFilters] = React.useState(null);

    const taskViews = [
      {name: "Compact", value: 3,
      array: [{text: "Order", field: "priority_order", width: '2%', maxWidth: 150,style: 'smallListItemText', type: 'number'},
              {text: "WO #", field: "table_id", width: '3%', maxWidth: 100,style: 'smallListItemText', type: 'number'},
              {text: "Name", field: "t_name", width: '26%', maxWidth: 170, style: 'boldListItemText', type: 'text'},
              {text: "State", field: "state", width: '3%', maxWidth: 100, style: 'smallListItemText', type: 'text'},
              {text: "Type", field: "type", width: '5%', maxWidth: 100,style: 'smallListItemText', type: 'text'},
              {text: "Description", field: "description", width: '17%', maxWidth: 170, style: 'smallListItemText', type: 'text'},
              // {text: "Status", field: "woi_status_check", width: '8%', maxWidth: 100, style: 'artSignDrillSmallListItemText', type: 'text', dontShowInPdf: true},
              {text: "Arrival Date", field: "wo_arrival_dates", width: '7%', maxWidth: 50, style: 'artSignDrillSmallListItemText', type: 'text', dontShowInPdf: true},
              {text: "Drill Date", field: "drill_date", width: '7%', maxWidth: 100, style: 'drillSmallListItemText', type: 'date'},
              {text: "Drill Crew", field: "drill_crew", width: '6%', maxWidth: 100, style: 'drillSmallListItemText', type: 'text', pdfField: 'drill_crew_leader'}, 
              {text: "Status", field: "woi_status_check", width: '3%', maxWidth: 100, style: 'artSignDrillSmallListItemText', type: 'text', dontShowInPdf: true},
              {text: "Install Date", field: "sch_install_date", width: '7%', maxWidth: 100,style: 'installSmallListItemText', type: 'date'},
              {text: "Install Crew", field: "install_crew", width: '5%', maxWidth: 100,style: 'installSmallListItemText',  type: 'text', pdfField: "install_crew_leader"}]},
    {name: "Compact(No Drill)", value: 1,
       array: [{text: "Order", field: "priority_order", width: '2%', maxWidth: 150,style: 'smallListItemText', type: 'number'},
              {text: "WO #", field: "table_id", width: '3%', maxWidth: 100,style: 'smallListItemText', type: 'number'},
              {text: "Name", field: "t_name", width: '32%', maxWidth: 170, style: 'boldListItemText', type: 'text'},
              {text: "State", field: "state", width: '3%', maxWidth: 100, style: 'smallListItemText', type: 'text'},
              {text: "Type", field: "type", width: '5%', maxWidth: 100,style: 'smallListItemText', type: 'text'},
              {text: "Description", field: "description", width: '21%', maxWidth: 170, style: 'smallListItemText', type: 'text'},
              //{text: "Status", field: "woi_status_check", width: '10%', maxWidth: 100, style: 'artSignDrillSmallListItemText', type: 'text', dontShowInPdf: true},
              {text: "Arrival Date", field: "wo_arrival_dates", width: '8%', maxWidth: 50, style: 'artSignDrillSmallListItemText', type: 'text', dontShowInPdf: true},
              {text: "Status", field: "woi_status_check", width: '3%', maxWidth: 100, style: 'artSignDrillSmallListItemText', type: 'text', dontShowInPdf: true},
              {text: "Install Date", field: "sch_install_date", width: '7%', maxWidth: 100,style: 'installSmallListItemText', type: 'date'},
              {text: "Install Crew", field: "install_crew", width: '7%', maxWidth: 100,style: 'installSmallListItemText',  type: 'text', pdfField: "install_crew_leader"}  ]},
    {name: "Service Dept", value: 2,
       array: [{text: "Order", field: "priority_order", width: '4%', maxWidth: 150,style: 'smallListItemText', type: 'number'},
              {text: "WO #", field: "table_id", width: '4%', maxWidth: 100,style: 'smallListItemText', type: 'number'},
              {text: "WO Created", field: "date_entered", width: '5%', style: 'smallListItemText', type: 'date'},
              {text: "Desired", field: "date_desired", width: '5%', style: 'smallListItemText', type: 'date'},
              {text: "Name", field: "t_name", width: '18%', maxWidth: 170, style: 'boldListItemText', type: 'text'},
              {text: "State", field: "state", width: '3%', maxWidth: 100, style: 'smallListItemText', type: 'text'},
              {text: "Type", field: "type", width: '5%', maxWidth: 100,style: 'smallListItemText', type: 'text'},
              {text: "Description", field: "description", width: '15%', maxWidth: 170, style: 'smallListItemText', type: 'text'},
              {text: "Job Reference", field: "job_reference", width: '8%', maxWidth: 120, style: 'smallListItemText', type: 'text'},
              {text: "Service Date", field: "field_date", width: '7%', maxWidth: 100,style: 'installSmallListItemText', type: 'date'},
              {text: "Service Crew", field: "field_crew", width: '7%', maxWidth: 100,style: 'installSmallListItemText',  type: 'text', pdfField: "field_crew_leader"},
              {text: "Service Type", field: "field_type", width: '7%', maxWidth: 100,style: 'installSmallListItemText', type: 'text'},
              {text: "Services", field: "field_num_services", width: '7%', maxWidth: 100,style: 'installSmallListItemText', type: 'text'},
    ]}]

    

    const job_types = [{type: 'install', color: "#004488", shorthand: 'IN'},
                    {type: 'drill', color: "#3c00d0", shorthand: 'DR'},
                    {type: 'lampbanks', color: "#ea7500", shorthand: 'LB'},
                    {type: 'sportsplayer', color: "#e30000", shorthand: 'SP'},
                    {type: 'service', color: "#444", shorthand: 'SR'},
                    {type: 'wireless', color: "#fc00d2", shorthand: 'WL'},
                    {type: 'power', color: "#00af7e", shorthand: 'PR'},
                    {type: 'marquee', color: "#5b443b", shorthand: 'MQ'},
                    {type: 'video', color: "#bb6cff", shorthand: 'VD'}]

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

  //Saved Filters
  useEffect(()=>{
    if(savedFilters == null && user){
        var user_id = user?.id;
        Settings.getTaskUserFilters(user_id)
        .then((data)=>{
            if(data){
                var savedFilters = data?.map((item)=>{
                    item.filter_json = JSON.parse(item.filter_json);
                    return item;
                })
                console.log("taskUSerfilters", savedFilters);
                setSavedFilters(savedFilters);
            }
        })
        .catch((error)=>{
            console.error("Failed to get user filters");
            cogoToast.error("Failed to get user filters");
        })
    }
    
},[savedFilters, user])

  //Refresh
  useEffect(()=>{
    if(refreshView && refreshView == "taskList"){
        setSavedFilters(null)
    }
  },[refreshView])

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

  //Save and/or Fetch filters to local storage
  useEffect(() => {
    if(installDateFilters == null){
      var tmp = window.localStorage.getItem('installDateFilters');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setInstallDateFilters(tmpParsed);
      }else{
        setInstallDateFilters([]);
      }
    }
    if(Array.isArray(installDateFilters)){
      window.localStorage.setItem('installDateFilters', JSON.stringify(installDateFilters));
    }
    
  }, [installDateFilters]);

  //Save and/or Fetch filters to local storage
  useEffect(() => {
    if(drillDateFilters == null){
      var tmp = window.localStorage.getItem('drillDateFilters');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setDrillDateFilters(tmpParsed);
      }else{
        setDrillDateFilters([]);
      }
    }
    if(Array.isArray(drillDateFilters)){
      window.localStorage.setItem('drillDateFilters', JSON.stringify(drillDateFilters));
    }
    
  }, [drillDateFilters]);

  //Save and/or Fetch filters to local storage
  useEffect(() => {
    if(arrivalDateFilters == null){
      var tmp = window.localStorage.getItem('arrivalDateFilters');
      var tmpParsed;
      if(tmp){
        tmpParsed = JSON.parse(tmp);
      }
      if(Array.isArray(tmpParsed)){
        setArrivalDateFilters(tmpParsed);
      }else{
        setArrivalDateFilters([]);
      }
    }
    if(Array.isArray(arrivalDateFilters)){
      window.localStorage.setItem('arrivalDateFilters', JSON.stringify(arrivalDateFilters));
    }
    
  }, [arrivalDateFilters]);

  
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
  

   useEffect(()=>{
      if(isNaN(activeTaskView) || activeTaskView == null ){
        return;
      }
      // activeTaskView === undefined ?

      var viewArray = [...taskViews.find((item)=> item.value === activeTaskView)?.array];
      console.log("viewArray",viewArray)
      if( viewArray && Array.isArray(viewArray)){
        setTableInfo(viewArray)
      }
  } ,[activeTaskView])

  //Save and/or Fetch tableInfo to local storage
  useEffect(() => {
  if(tableInfo == null && savedFilters != null){
    var tmp = window.localStorage.getItem('activeTaskView');
    var tmpParsed;
    if(tmp){
      tmpParsed = JSON.parse(tmp);
    }
    
    if(tmpParsed != null || tmpParsed != undefined){
      setActiveTaskView(tmpParsed);
    }else{
      setActiveTaskView(1);
    }
  }
  if(!isNaN(activeTaskView) && activeTaskView != null){
    window.localStorage.setItem('activeTaskView', JSON.stringify(activeTaskView));
  }
  
}, [tableInfo, activeTaskView, savedFilters]);
  

  return (
    <div className={classes.root}>
      <TaskContext.Provider value={{taskLists,setTaskLists,priorityList,setPriorityList, selectedIds, setSelectedIds, 
                            tabValue, setTabValue, taskListToMap, setTaskListToMap, crewToMap, setCrewToMap, setRows, filterSelectedOnly, setFilterSelectedOnly,
                            filterScoreboardsAndSignsOnly, setFilterScoreboardsAndSignsOnly,tableInfo ,setTableInfo,activeTaskView, setActiveTaskView,
                            modalOpen, setModalOpen, modalTaskId, setModalTaskId, filters, setFilters,filterInOrOut, setFilterInOrOut, filterAndOr, setFilterAndOr,
                             sorters, setSorters, installDateFilters, setInstallDateFilters, drillDateFilters, setDrillDateFilters,
                             arrivalDateFilters, setArrivalDateFilters, taskListTasksSaved, setTaskListTasksSaved, 
                             user, refreshView, setRefreshView, taskViews, job_types, savedFilters, setSavedFilters} } >
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
