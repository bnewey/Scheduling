import React, {useRef, useState, useEffect, useContext} from 'react';
import {makeStyles, Paper,IconButton,ListItemSecondaryAction, ListItem, ListItemText, FormControlLabel, Switch,Grid, List,
     TableContainer, Table, TableHead, TableRow, TableCell } from '@material-ui/core';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

import CircularProgress from '@material-ui/core/CircularProgress';
import TaskListTasks from './TaskListTasks';
import TaskListToolbar from './TaskListToolbar';
import TaskListSidebar from './TaskListSidebar';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';
import NoSsr from '../../UI/NoSsr';
import dynamic from 'next/dynamic'

import TaskLists from '../../../js/TaskLists';
import cogoToast from 'cogo-toast';

import {TaskContext} from '../TaskContainer';
import TaskListFilter from './TaskListFilter';
import TLDrillDateFilter from './components/TLDrillDateFilter';
import TLInstallDateFilter from './components/TLInstallDateFilter';
import TLArrivalDateFilter from './components/TLArrivalDateFilter';
import TLCrewFilter from './components/TLCrewFilter'

import {createSorter} from '../../../js/Sort';
import {createFilter} from '../../../js/Filter';

const KeyBinding = dynamic(()=> import('react-keybinding-component'), {
    ssr: false
  });

const TaskListMain = (props) => {
    //STATE
    const [taskListTasks, setTaskListTasks] = React.useState(null);
    const [taskListTasksRefetch, setTaskListTasksRefetch] = React.useState(false);
    const [selectedTasks, setSelectedTasks] = useState([]);
    
    

    
    //PROPS
    const { isPriorityOpen, setIsPriorityOpen, woiData, setWoiData} = props;

    const {taskLists, setTaskLists, tabValue, setTabValue,
        taskListToMap, setTaskListToMap,setModalTaskId, 
        modalOpen, setModalOpen, priorityList, setPriorityList, setSelectedIds, 
        filters, setFilters,filterInOrOut, setFilterInOrOut,filterAndOr,
         sorters, setSorters,sorterState, setSorterState, installDateFilters , setInstallDateFilters,drillDateFilters, arrivalDateFilters, setArrivalDateFilters,
         taskListTasksSaved, setTaskListTasksSaved, tLTasksExtraSaved, setTLTasksExtraSaved, refreshView,tableInfo ,setTableInfo,setActiveTaskView, taskViews , activeTaskView,
         setRefreshView, setDrillDateFilters, drillCrewFilters, setDrillCrewFilters, installCrewFilters, setInstallCrewFilters, user, activeTVOrder,} = useContext(TaskContext);


    //CSS
    const classes = useStyles({sorterState, sorters});
    //Refresh
    useEffect(()=>{
        if(refreshView && refreshView == "taskList"){
            setTaskListTasksRefetch(true)
        }
    },[refreshView])

    //TaskListTasks
    useEffect( () =>{ 
        //Gets data only on initial component mount
        if(taskLists == null){
            //setTaskListTasks(null);
            setTaskListTasksRefetch(true);
        }
        if(taskLists && taskListToMap && taskListToMap.id && (taskListTasks == null || taskListTasksRefetch == true)
                 && filterInOrOut != null && filterAndOr != null  && filters != null && installDateFilters != null &&
                  drillDateFilters != null && arrivalDateFilters != null && drillCrewFilters != null && installCrewFilters != null ) { 
            if(taskListTasksRefetch == true){
                setTaskListTasksRefetch(false);
            }
            TaskLists.getTaskList(taskListToMap.id)
            .then( (data) => {
                if(!Array.isArray(data)){
                    console.error("Bad tasklist data",data);
                    return;
                }

                var tmpData = [];

                //FILTER -------------------------------------------------------------------------------------
                if(filters && filters.length > 0 && filterInOrOut != null){
                    //If more than one property is set, we need to filter seperately
                    let properties = new Set([...filters].map((v,i)=>v.property));
                    
                    properties.forEach((index,property)=>{
                    
                        let tmpFilter = filters.filter((v,i)=> v.property == property);
                        let tmpTmpData;
    
                        //On or use taskListTasksSaved to filter from to add to 
                        if((filterAndOr == "or" && filterInOrOut == "in") || (filterAndOr == "and" && filterInOrOut == "out")){
                            if(tmpFilter.length > 1){
                                //Always use 'or' on same property
                                tmpTmpData = data.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                            }
                            if(tmpFilter.length <= 1){
                                tmpTmpData = data.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                                //console.log("MapContainer tmpData in loop", tmpData);
                            }
                            //Add to our big array
                            tmpData.splice(tmpData.length, 0, ...tmpTmpData);
                            //Remove duplicates
                            tmpData.splice(0, tmpData.length, ...(new Set(tmpData)));
                        }
    
                        //On and use tmpData to filter from
                        if((filterAndOr == "and" && filterInOrOut == "in") || (filterAndOr == "or" && filterInOrOut == "out")){
                            if(tmpData.length <= 0){
                              tmpData = [...data];
                            }  
                            if(tmpFilter.length > 1){
                                //Always use 'or' on same property
                                tmpData = tmpData.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                            }
                            if(tmpFilter.length <= 1){
                                tmpData = tmpData.filter(createFilter([...tmpFilter], filterInOrOut, "or"));
                            }
                        }
                        
                    })   
                }

                //Save after initial filters
                var savedTmpData = tmpData;
                //Need to sort for our 
                if(sorters && sorters.length > 0){
                    savedTmpData = savedTmpData.sort(createSorter(...sorters))
                    //Set saved for filter list 
                }
                setTLTasksExtraSaved(savedTmpData);
                console.log("tmpData for extra saved", savedTmpData);
                

                if(installDateFilters.length > 0){
                    if(tmpData.length <= 0 && filters && !filters.length){
                        tmpData = [...data];
                    }  
                    tmpData = tmpData.filter(createFilter([...installDateFilters], "in", "or"));

                }

                if(drillDateFilters.length > 0){
                    if(tmpData.length <= 0 && filters && !filters.length && installDateFilters && !installDateFilters.length){
                        tmpData = [...data];
                    }  
                    tmpData = tmpData.filter(createFilter([...drillDateFilters], "in", "or"));

                }

                if(arrivalDateFilters.length > 0){
                    if(tmpData.length <= 0 && filters && !filters.length && installDateFilters && !installDateFilters.length && drillDateFilters && !drillDateFilters.length){
                        tmpData = [...data];
                    }  
                    tmpData = tmpData.filter(createFilter([...arrivalDateFilters], "in", "or"));

                }

                if(drillCrewFilters.length > 0){
                    if(tmpData.length <= 0 && filters && !filters.length && installDateFilters && !installDateFilters.length
                      && arrivalDateFilters && !arrivalDateFilters.length ){
                        tmpData = [...data];
                    }  
                    tmpData = tmpData.filter(createFilter([...drillCrewFilters], "in", "or"));
                  }
  
                  if(installCrewFilters.length > 0){
                    if(tmpData.length <= 0 && filters && !filters.length && installDateFilters && !installDateFilters.length
                      && arrivalDateFilters && !arrivalDateFilters.length && drillCrewFilters && !drillCrewFilters.length ){
                        tmpData = [...data];
                    }  
                    tmpData = tmpData.filter(createFilter([...installCrewFilters], "in", "or"));
                  }

                //No filters or sorters
                if(filters && !filters.length && installDateFilters && !installDateFilters.length && drillDateFilters && !drillDateFilters.length &&
                     arrivalDateFilters && !arrivalDateFilters.length && drillCrewFilters && !drillCrewFilters.length && installCrewFilters && !installCrewFilters.length){
                    //no change to tmpData
                    tmpData = [...data];
                }

                // -------------------------------------------------------------------------------------------
                  
                //SORT after filters -------------------------------------------------------------------------
                if(sorters && sorters.length > 0){
                    tmpData = tmpData.sort(createSorter(...sorters))
                    //Set saved for filter list 
                }
                //--------------------------------------------------------------------------------------------
               

                //Save all originally fetched data
                setTaskListTasksSaved(data);
                

                //Set TaskListTasks
                if(Array.isArray(tmpData)){
                    setTaskListTasks(tmpData);
                }
                setWoiData(null);
                
            })
            .catch( error => {
                cogoToast.error(`Error getting Task List`, {hideAfter: 4});
                console.error("Error getting tasklist", error);
            })
        }
        return () => { //clean up
            if(taskLists){
            }
        }
    },[taskListToMap,taskListTasks, taskLists, filterInOrOut, filterAndOr, taskListTasksRefetch, filters, installDateFilters,
         drillDateFilters, arrivalDateFilters, drillCrewFilters, installCrewFilters]);

    //WOIDATA 
    useEffect(()=>{
        // if(taskListTasks == null){
        //     setWoiData(null);
        // }
        if(woiData == null && taskListToMap){
            TaskLists.getAllSignScbdWOIFromTL(taskListToMap.id)
            .then((data)=>{
                //console.log("woi data", data);
                setWoiData(data);
            })
            .catch((error)=>{
                console.error("Failed to get Sign WOI Data", error);
                cogoToast.error("Internal Server Error");
            })
        }
    },[woiData, taskListToMap])

    //Save and/or Fetch sorters to local storage
    useEffect(() => {
        if(sorters == null){
        var tmp = window.localStorage.getItem('sorters');
        var tmpParsed;
        if(tmp){
            tmpParsed = JSON.parse(tmp);
        }
        if(Array.isArray(tmpParsed)){
            setSorters(tmpParsed);
        }else{
            setSorters([{"property":activeTVOrder,"direction":"ASC"}]);
        }
        }
        if(Array.isArray(sorters)){
            window.localStorage.setItem('sorters', JSON.stringify(sorters));
        }

    }, [sorters]);

    //Sort
    useEffect(()=>{
        if (Array.isArray(sorters) && sorters.length) {
            if (taskListTasks && taskListTasks.length) {
                var tmpData = taskListTasks.sort(createSorter(...sorters))
                console.log(tmpData);
                var copyObject = [...tmpData];
                setTaskListTasks(copyObject);
                cogoToast.success(`Sorting by ${sorters.map((v, i)=> v.property + ", ")}`);
            }
        }
    },[sorters]);
    

    const handleListSort = (event, item) =>{
        if(!item){
            cogoToast.error("Bad field while trying to sort");
            return;
        }
        //sort taskListItems according to item
        //this sort can take multiple sorters but i dont think its necessary
           // if it is, you will have to change the [0] to a dynamic index!
        if(item.type == 'date' || item.type == 'datetime' || item.type == 'number' || item.type == 'text'){
            switch(sorterState){
                case 0:
                    setSorterState(1);
                    break;
                case 1:
                    if(sorters[0].property == item.field){
                        setSorterState(2)
                    }else{
                        setSorterState(1);
                    }
                    break;
                case 2:
                    setSorterState(1);
                    break;
                default: 
            }
            setSorters([{
                property: item.field, 
                direction: sorters && sorters[0] && sorters[0].property == item.field ? 
                ( sorters[0].direction === 'DESC' ? "ASC" : sorters[0].direction === 'ASC' ? "DESC" : "ASC" ) : "ASC"
            }]);   
        }
    }

    const handleClearSelectedTasksOnEsc = (keyCode) =>{
        if(isNaN(keyCode)){
            console.error("Bad keycode on handleClearSelectedTasksOnEsc");
            return;
        }
        if(keyCode === 27){
            setSelectedTasks([]);
        }
    }

    const handleRefreshView = () =>{
        //Refreshes based on which tab is currently active
        //only using taskList bc thats the only page with quick filter access for now
        var viewToRefresh;
        switch(tabValue){
            case 0:
                viewToRefresh = "calendar"
                break;
            case 1:
                viewToRefresh = "taskList"
                break;
            case 2:
                viewToRefresh = "map"
                break;
            // case 3:
            //     viewToRefresh = "crew"
            //     break;
            // case 4:
            //     viewToRefresh = "allTasks"
            //     break;
        }
        if(viewToRefresh){
            setRefreshView(viewToRefresh);
        }
    }
     
    return(
        <>
            <KeyBinding onKey={ (e) => handleClearSelectedTasksOnEsc(e.keyCode) } />
            <TaskListToolbar taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap} 
                            taskListTasks={taskListTasks} setTaskListTasks={setTaskListTasks} 
                            isPriorityOpen={isPriorityOpen} setIsPriorityOpen={setIsPriorityOpen}
                            priorityList={priorityList} setPriorityList={setPriorityList} setSelectedIds={setSelectedIds}
                            taskListTasksRefetch={taskListTasksRefetch} setTaskListTasksRefetch={setTaskListTasksRefetch}/>
            <Grid container >  
                <Grid item xs={2} >
                    <TaskListSidebar taskListTasks={taskListTasks} setTaskListTasks={setTaskListTasks}
                                 taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap} 
                                 isPriorityOpen={isPriorityOpen} setIsPriorityOpen={setIsPriorityOpen}
                                  priorityList={priorityList} setPriorityList={setPriorityList}
                                  selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks} setSelectedIds={setSelectedIds}
                                  setActiveTaskView={setActiveTaskView}  setTableInfo={setTableInfo}
                                  taskListTasksRefetch={taskListTasksRefetch} setTaskListTasksRefetch={setTaskListTasksRefetch}/>
                </Grid>
                <Grid item xs={10} >
                   
                    <Paper className={classes.root}>
                        <TaskListFilter filteredItems={taskListTasks}  setFilteredItems={setTaskListTasks} />
                        {taskListTasks && tableInfo && taskListTasksSaved ? 
                        <>  
                                <List >
                                    <ListItem className={classes.HeadListItem} classes={{container: classes.liContainer}}>
                                        <div style={{flex: `0 0 2%`}}>&nbsp;</div>
                                    {tableInfo.map((item, i)=>{
                                        const isSorted =  sorters && sorters[0] && sorters[0].property == item.field;
                                        const isASC = sorters && sorters[0] && sorters[0].direction === 'ASC';
                                        return(
                                        <ListItemText      id={"Head-ListItem"+i} 
                                                        align="center"
                                                        key={item.field + i +'_head'}
                                                        className={classes.listItemText} 
                                                        style={{flex: `0 0 ${item.width("large")}`}} 
                                                        classes={{primary: classes.listItemTextPrimary}}
                                                        
                                                        >
                                                            <span onClick={event=>handleListSort(event, item)}>
                                                        {item.text}
                                                        </span>
                                                        {isSorted ?
                                                            <div>
                                                                {isASC ? <ArrowDropDownIcon/> : <ArrowDropUpIcon/>}
                                                            </div> 
                                                            : <></>}
                                                            
                                                            <span>
                                                            {item.field == "drill_date" && <TLDrillDateFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} drillDateFilters={drillDateFilters}
                      setDrillDateFilters={setDrillDateFilters} setRefreshView={setRefreshView} tabValue={tabValue} setSorters={setSorters} activeTVOrder={activeTVOrder}/>}
                      {item.field == "sch_install_date" && <TLInstallDateFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} installDateFilters={installDateFilters}
                      setInstallDateFilters={setInstallDateFilters} setRefreshView={setRefreshView} tabValue={tabValue} setSorters={setSorters} activeTVOrder={activeTVOrder}/>}
                      {item.field == "wo_arrival_dates" && <TLArrivalDateFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} arrivalDateFilters={arrivalDateFilters}
                      setArrivalDateFilters={setArrivalDateFilters} setRefreshView={setRefreshView} tabValue={tabValue} setSorters={setSorters} activeTVOrder={activeTVOrder}/>}
                      {item.field == "install_crew" && <TLCrewFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} crewFilters={installCrewFilters}
                      setCrewFilters={setInstallCrewFilters} setRefreshView={setRefreshView} tabValue={tabValue} fieldId={"install_crew"} setSorters={setSorters} activeTVOrder={activeTVOrder}/>}
                      {item.field == "drill_crew" && <TLCrewFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} crewFilters={drillCrewFilters}
                      setCrewFilters={setDrillCrewFilters} setRefreshView={setRefreshView} tabValue={tabValue} fieldId={"drill_crew"} setSorters={setSorters} activeTVOrder={activeTVOrder}/>}
                                                            </span>
                                        </ListItemText>
                                    )})}
                                    
                                    </ListItem>
                                
                                <TaskListTasks 
                                    user={user}
                                    activeTaskView={activeTaskView}
                                    selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks}
                                    taskListTasks={taskListTasks} setTaskListTasks={setTaskListTasks}
                                    taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap}
                                    setModalOpen={setModalOpen} 
                                    setModalTaskId={setModalTaskId}
                                    tableInfo={tableInfo}
                                    priorityList={priorityList} setTaskListToMap={setTaskListToMap} setSelectedIds={setSelectedIds}
                                    taskListTasksSaved={taskListTasksSaved} setTaskListTasksSaved={setTaskListTasksSaved} sorters={sorters} filters={filters}
                                    woiData={woiData} taskListTasksRefetch={taskListTasksRefetch} setTaskListTasksRefetch={setTaskListTasksRefetch}
                                    taskLists={taskLists}
                                    activeTVOrder={activeTVOrder}/>
                                </List>
                        </>
                        : <>
                        <div className={classes.HeadListItem} classes={{container: classes.liContainer}}>
                                <span id="Head-ListItem" className={classes.listItemTextPrimary}>
                                        Select a Task List in the dropdown menu above.
                                </span>
                            </div>
                        </>}

                        
                    </Paper>
                </Grid>
            </Grid>
            
            
        </>
    );

} 

export default TaskListMain;

const useStyles = makeStyles(theme => ({
    root: {
        padding: '.62% .3% .3% .3%',
        margin: '0px 0px 5px 5px',
        backgroundColor: '#fff',
        height: '100%',

    },
    HeadListItem:{
        backgroundColor: '#293a5a !important',
        boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
        fontSize: '12px',
        fontWeight: '700',
        display:'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-around',
        padding: '3px',
        paddingRight: '1% !important',
        
    },
    liContainer: {
        listStyle: 'none',
        margin: '5px 8px 0px 8px',
     },
    listItemTextPrimary:{
        '& span':{
            display: 'inline-flex',
            justifyContent: 'center',
            '&:hover':{
                textDecoration: 'underline',
                color: '#ececec',
                cursor: 'pointer',
            },
            '& .MuiSvgIcon-root':{
                position: 'absolute',
                marginLeft: '1px',
                top: '20%',
                fontSize: '1.5em',
            }
        },
        fontWeight: '600',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap'
     },
    listItemText:{
        textAlign: 'center',
        
     },
     checkHead:{

     }

      
  }));
