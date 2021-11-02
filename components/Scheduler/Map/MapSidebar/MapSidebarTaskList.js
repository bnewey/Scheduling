import React, {useRef, useState, useEffect, useContext, useLayoutEffect} from 'react';


import {makeStyles, List, ListItem, ListItemSecondaryAction, ListItemText,IconButton, Switch, 
        Paper, Grid,  ListSubheader,  Popover, Checkbox, Button,
        Collapse, Accordion, AccordionDetails, AccordionSummary, Tooltip} from '@material-ui/core';

//import { List } from 'react-virtualized';
import ReactDOM from 'react-dom';

import DeleteIcon from '@material-ui/icons/Clear';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import EditIcon from '@material-ui/icons/Edit';
import cogoToast from 'cogo-toast';
import _ from 'lodash';

import clsx from 'clsx';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Tasks from '../../../../js/Tasks';
import Crew from '../../../../js/Crew';
import TaskLists from '../../../../js/TaskLists';
import {TaskContext} from '../../TaskContainer';
import Util from '../../../../js/Util';

import TaskListMain from '../../TaskList/TaskListMain';

import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';


import TLDrillDateFilter from '../../TaskList/components/TLDrillDateFilter'
import TLInstallDateFilter from '../../TaskList/components/TLInstallDateFilter';
import TLArrivalDateFilter from '../../TaskList/components/TLArrivalDateFilter';
import TLCrewFilter from '../../TaskList/components/TLCrewFilter'
import TaskListTasks from '../../TaskList/TaskListTasks';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SwapIcon from '@material-ui/icons/SwapHoriz';
import moment from 'moment'

import { MapContext } from '../MapContainer';



const MapSiderbarTaskList = (props) =>{


    //STATE
    const { panelRef } = props;

    //PROPS
    const {taskListToMap, setTaskListToMap,  modalOpen, setModalOpen, setModalTaskId, taskLists,
        installDateFilters, setInstallDateFilters, drillDateFilters, setDrillDateFilters,
        drillCrewFilters, setDrillCrewFilters, installCrewFilters, setInstallCrewFilters,
        arrivalDateFilters, setArrivalDateFilters,tableInfo ,setTableInfo, activeTaskView,setRefreshView, tabValue,
        taskListTasks, setTaskListTasks, taskListTasksRefetch, setTaskListTasksRefetch,
         taskListTasksSaved , setTaskListTasksSaved, tLTasksExtraSaved, setTLTasksExtraSaved, sorters, sorterState,setSorters, filters, taskViews, setSelectedIds} = useContext(TaskContext);
    const {mapRows, setMapRows, markedRows, setMarkedRows,  mapRowsRefetch, setMapRowsRefetch, activeMarker,setActiveMarker,expandedAnimDone,
        setShowingInfoWindow, woiData, setWoiData} = useContext(MapContext);
    
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [priorityList, setPriorityList] = useState(null);
    
    const [selectedTasks, setSelectedTasks] = useState([]);

    const [scrollToIndex, setScrollToIndex] = useState(-1);

    //CSS
    const classes = useStyles();
    //FUNCTIONS

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
                if(error?.user_error){
                    cogoToast.error(error.user_error);
                }else{
                    cogoToast.error("Internal Server Error");
                }
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
            setSorters([{"property":"priority_order","direction":"ASC"}]);
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
    
    // const handleToggle = (id, event) => {     
    //     var task = markedRows.filter((row, i) => row.t_id === id)[0];
    //     setActiveMarker({type: "task", item: task});
    //     setShowingInfoWindow(true);
    // };

    //scroll into view 
    function isInViewport(element, parent) {
      const rect = element.getBoundingClientRect();
      const parent_rect = parent.getBoundingClientRect();
      return (
          rect.top > parent_rect.top
           && rect.bottom < parent_rect.bottom 
      );
    }

    useEffect(()=>{
        console.log("panelRef", panelRef);
        // if(activeMarker?.type === "task" && activeMarker?.item && panelRef.current ){
          
        //   var el = panelRef?.current?.querySelector("#mapMarkedListItem"+activeMarker.item.t_id);
        //   console.log("Panelref", panelRef.current);
        //   if(!el){
        //     console.error("No element for isInViewPort", el);
        //     console.log(activeMarker);
        //     return;
        //   }
        //   if(!isInViewport(el, panelRef.current)){
        //     el.scrollIntoView({behavior: "smooth",inline: "nearest"});
        //   }
          
        // }
        if(markedRows && activeMarker?.type === "task" && activeMarker?.item){
            var index;
            index = _.findIndex(markedRows, {t_id: activeMarker.item.t_id} );
            console.log("index", index);
            console.log("activeMarker", activeMarker);
            console.log("marked rows", markedRows)
            setScrollToIndex( index)
        }
        
      },[markedRows, activeMarker, tabValue, expandedAnimDone, panelRef])

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

    const handleTaskClick = (event, task)=>{
        if(!task){
            console.error("Failed to set activeTask")
            return;
        }

        var task = markedRows.filter((row, i) => row.t_id === task.t_id)[0];
        setActiveMarker({type: "task", item: task});
        setShowingInfoWindow(true);
    }

    const handleTaskContextMenu = (event, task)=>{
        setModalTaskId(task.t_id);
        setModalOpen(true);
  
        //Disable Default context menu
        event.preventDefault();
    }

    return(
      <>
        
        {markedRows && tableInfo && taskListTasksSaved ? 
                <>  
                        <List ref={panelRef} >
                            <ListItem className={classes.HeadListItem} classes={{container: classes.liContainer}}>
                                <div style={{flex: `0 0 2%`}}>&nbsp;</div>
                            {tableInfo.filter((item)=> !item.dontShowInSmall).map((item, i)=>{
                                const isSorted =  sorters && sorters[0] && sorters[0].property == item.field;
                                const isASC = sorters && sorters[0] && sorters[0].direction === 'ASC';
                                return(
                                <ListItemText      id={"Head-ListItem"+i} 
                                                align="center"
                                                key={item.field + i +'_head'}
                                                className={classes.listItemText} 
                                                style={{flex: `0 0 ${item.width('small')}`}} 
                                                classes={{primary: classes.listItemTextPrimary}}
                                                
                                                >
                                                    <div className={classes.listItemDiv}>
                                                    <span onClick={event=>handleListSort(event, item)}>
                                                        {item.text}
                                                    </span>
                                                
                                                    
                                                    {item.field == "drill_date" && <TLDrillDateFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} drillDateFilters={drillDateFilters}
                setDrillDateFilters={setDrillDateFilters} setRefreshView={setRefreshView} tabValue={tabValue} />}
                {item.field == "sch_install_date" && <TLInstallDateFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} installDateFilters={installDateFilters}
                setInstallDateFilters={setInstallDateFilters} setRefreshView={setRefreshView} tabValue={tabValue} />}
                {item.field == "wo_arrival_dates" && <TLArrivalDateFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} arrivalDateFilters={arrivalDateFilters}
                setArrivalDateFilters={setArrivalDateFilters} setRefreshView={setRefreshView} tabValue={tabValue} />}
                {item.field == "install_crew" && <TLCrewFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} crewFilters={installCrewFilters}
                      setCrewFilters={setInstallCrewFilters} setRefreshView={setRefreshView} tabValue={tabValue} fieldId={"install_crew"}/>}
                {item.field == "drill_crew" && <TLCrewFilter taskViews={taskViews} activeTaskView={activeTaskView} handleRefreshView={handleRefreshView}  tLTasksExtraSaved={tLTasksExtraSaved} crewFilters={drillCrewFilters}
                setCrewFilters={setDrillCrewFilters} setRefreshView={setRefreshView} tabValue={tabValue} fieldId={"drill_crew"} />}

                                                    {isSorted ?
                                                    <div>
                                                        {isASC ? <ArrowDropDownIcon/> : <ArrowDropUpIcon/>}
                                                    </div> 
                                                    : <></>}
                                                    </div>
                                </ListItemText>
                            )})}
                            
                            </ListItem>
                        
                        <TaskListTasks 
                            selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks}
                            taskListTasks={markedRows} setTaskListTasks={setMarkedRows}
                            taskListToMap={taskListToMap} setTaskListToMap={setTaskListToMap}
                            setModalOpen={setModalOpen} 
                            setModalTaskId={setModalTaskId}
                            tableInfo={tableInfo?.filter((item)=> !item.dontShowInSmall) || []}
                            priorityList={priorityList} setTaskListToMap={setTaskListToMap} setSelectedIds={setSelectedIds}
                            selectedTasks={[activeMarker?.item?.t_id]}
                            taskListTasksSaved={taskListTasksSaved} setTaskListTasksSaved={setTaskListTasksSaved} sorters={sorters} filters={filters}
                            woiData={woiData} taskListTasksRefetch={mapRowsRefetch} setTaskListTasksRefetch={setMapRowsRefetch}
                            taskLists={taskLists} 
                            sizeOfTable={'small'}
                            scrollToIndex={scrollToIndex} setScrollToIndex={setScrollToIndex}
                            handleTaskClick={handleTaskClick} handleTaskContextMenu={handleTaskContextMenu}/>
                        </List>
                </>
                : <>
                <div className={classes.HeadListItem} classes={{container: classes.liContainer}}>
                        <span id="Head-ListItem" className={classes.listItemTextPrimary}>
                                Select a Task List in the dropdown menu above.
                        </span>
                    </div>
                </>}
                       
                        
        </>
            
    );

}
export default MapSiderbarTaskList;




const useStyles = makeStyles(theme => ({
  root: {
      margin: '10px 0px 10px 0px',
      color: '#535353',
      width: '100%',
  },
  items:{
      color: '#fcfcfc'
  },
  MarkerInfo:{
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#16233b',
    backgroundColor: '#abb7c93d',
    padding: '2px',

  },
  MarkerSubInfo:{
      marginLeft:'5%',
      display:'block',
      fontSize: '11px',
      fontWeight: '400',
      color: '#666464',
  },
    taskNameSpan:{
        fontWeight: '600',
        color: '#1f2f52',
    },
    taskNameCompSpan:{
      color: '#33bb23',
      background: '#ffffffa3',
      borderRadius: 2,
      padding: '0px 9px',
      fontWeight: 600,
    },
    job_list_task_info:{
        textAlign: 'center',
        flexBasis: '17%',
        '& span':{
            fontWeight: '500',
        }
    },
    job_list_task_completed:{
        textAlign: 'center',
        flexBasis: '12%',
        '& span':{
            fontWeight: '500',
        }
    },
    headListItemSpan:{
      color: '#fff',
    },
    drillSpan:{
        color: '#216fac',
    },
    // listItemText:{
    //   marginTop: 0,
    //   marginBottom: 0,
    // },
    // showCompletedDiv:{
    //   display: 'flex',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   background: '#cef3eb',
    // },
    // showCompletedSpan:{
    //   fontSize: '.8em',
    //   fontFamily: 'sans-serif',
    //   color: '#333'
    // }
    list_head:{
      lineHeight: '24px',
      borderRadius: '5px',
  },
  text_button:{
      textAlign: 'center',
      cursor: 'pointer',
      fontSize: '12px',
      color: '#677fb3',
      margin: '0% 3% 0% 0%',
      '&:hover':{
          color: '#697fb1',
          textDecoration: 'underline',
          backgroundColor: '#cecece',
      }
  },
  text_button_li:{
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      position: 'sticky',
      bottom: '0px',
      backgroundColor: '#dedede',
  },
  member_list_item:{
      backgroundColor: '#f9ebca',
      '&:hover':{
          backgroundColor: '#e9c46c',
          color: '#404654',
      },
      padding: '0% 5%',
      border: '2px solid #b2b2b2'
  },
  member_select_list_item:{
      backgroundColor: '#ffa93e',
      '&:hover':{
          backgroundColor: '#e18a1e',
          color: '#404654',
      },
      padding: '0% 5%',
      border: '2px solid #b2b2b2'
  },
  secondary_div:{
      flexBasis: '5%',
  },
  secondary_button:{
      padding: '5px',
      margin: '1%'
  },
  jobList:{
      //maxHeight: 359,
      overflowY: 'scroll',
  },
  completedList:{
      maxHeight: 359,
      overflowY: 'scroll',
      padding: '5px',
      width: '100%',
  },
  job_list_head:{
      backgroundColor: '#327370',
      color: '#fff',
      fontSize: '1.4em',
      fontWeight: '600',
  },
  job_root: {
      // margin: '0% 5%',
      color: '#535353',
      padding: '.6%',
      backgroundColor: '#fff',
      borderRadius: '4px',
      //boxShadow: '0px 1px 3px 0px #000000db',
      maxHeight: '700px',
  },
  buttonDiv:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '4px',
  },
  openButton:{
      backgroundColor: '#fca437',
      color: '#fff',
      margin: '0px 30px',
      fontWeight: '700',
      fontSize: '13px',
      padding: '0px 16px',
      '&:hover':{
          border: '',
          backgroundColor: '#ffedc4',
          color: '#d87b04'
      }
  },
  iconChecked:{
      width: '1em',
      height: '1em',
      color:'#33bb22',
  },
  icon:{
      width: '1em',
      height: '1em',
      color:'#929292',
      '&:hover':{
          color: '#303030',
      },
      backgroundColor: 'linear-gradient(0deg, #f5f5f5, white)'
  },
  inputDiv:{
      display:'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      //width: '25%',
      margin: '5px 0px',
      paddingRight:'15px', 
      color: '#a55400'
  },
  dateRangeContainer:{
    flexBasis: '70%',
    display: 'flex',
    flexDirection: 'row',
      justifyContent: 'start',
      alignItems: 'center',
    padding: '8px',
    margin: '4px 6px 2px 6px',
    borderRadius: '4px',
    border: '1px solid #bbb',
    background: '#fff',
  },
  dateRangeCheckbox:{
    flexBasis: '30%'
  },
  dateRangeDiv:{
      flexBasis: '70%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
  },
  dateRangeSpan:{
      fontSize: '13px',
      fontFamily: 'sans-serif',
      fontWeight:'600',
      color: '#666',
      textAlign: 'center'
  },
      inputSpan:{
      marginRight: '10px',
      fontSize: '13px',
      fontFamily: 'sans-serif',
  },
  inputField:{
      '& input':{
          backgroundColor: '#fff',
          padding: '5px 8px',
          width: '80px'
      }
  },
     crewFilterDiv:{
         flexBasis: '30%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '3px',
    },
    HeadListItem:{
        backgroundColor: '#293a5a !important',
        boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
        fontSize: '12px',
        fontWeight: '700',
        display:'flex',
        alignItems: 'start',
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
        display: 'flex',
        flexDirection: 'column',
     },
     listItemDiv:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
     }
}));