import React, {useRef, useState, useEffect, useContext, useCallback, useLayoutEffect} from 'react';

import {makeStyles, List as MUIList, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Checkbox, IconButton, CircularProgress, 
  Popover, ListSubheader,Tooltip} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';
import Router from 'next/router'
import moment from 'moment';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useWindowSize from '../../UI/useWindowSize';
import WoiStatusCheck from './components/WoiStatusCheck'
import TaskLists from '../../../js/TaskLists';
import Tasks from '../../../js/Tasks';
import cogoToast from 'cogo-toast';
import Util from '../../../js/Util';
import { select } from 'async';
import { CrewContext } from '../Crew/CrewContextContainer';

import { List } from 'react-virtualized';
import ReactDOM from 'react-dom';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';


import Crew from '../../../js/Crew';


const TaskListTasks = (props) =>{


    //STATE
    //PROPS
    const { taskListTasks, setTaskListTasks, taskListToMap , setModalOpen, setModalTaskId, tableInfo,
              priorityList, setTaskListToMap, setSelectedIds, selectedTasks, setSelectedTasks, taskListTasksSaved, setTaskListTasksSaved,
              sorters, filters, woiData, taskListTasksRefetch, setTaskListTasksRefetch} = props;
    
    const { setShouldResetCrewState, allCrews } = useContext(CrewContext);


    //Popover Add/swap crew
    const [addSwapCrewAnchorEl, setAddSwapCrewAnchorEl] = React.useState(null);
    const [addSwapCrewJob, setAddSwapCrewJob] = useState(null);

    //Popover WOI Status
    const [woiStatusAnchorEl, setWoiStatusAnchorEl] = React.useState(null);
    const [woiStatusRows, setWoiStatusRows] = useState([]);

    const targetRef = React.useRef();
    const [dimensions, setDimensions] = useState({ width:1500, height: 650 });

    //Gets size of our list container so that we can size our virtual list appropriately
    useLayoutEffect(() => {
      if (targetRef.current) {
        
        setDimensions({
          width: targetRef.current.offsetWidth,
          height: targetRef.current.offsetHeight
        });
      }
    }, []);
    

    //CSS
    const classes = useStyles();
    // //FUNCTIONS

    useEffect( () =>{ //useEffect for inputText  
      return () => { //clean up
            
            if(taskListToMap){
                //setTaskListTasks(null);
                //doesnt run currently
            }
        }
      },[taskListTasks]);

      useEffect(()=>{
        //unselected tasks on any change to filter
        setSelectedTasks([]);
      },[filters])
    

    //Modal
    const handleRightClick = (event, id) => {
      setModalTaskId(id);
      setModalOpen(true);

      //Disable Default context menu
      event.preventDefault();
    };
    ////

    //// DRAG N DROP

    // a little function to help us with reordering the result
    // const reorder = (list, startIndex, endIndex) => {
    //   const result = Array.from(list);
    //   const [removed] = result.splice(startIndex, 1);
    //   result.splice(endIndex, 0, removed);

    //   return result;
    // };

    const reorderMultiple = (list, ids, endIndex) =>{
      var result = Array.from(list); 
      const removedArray = [];
      result = result.filter((task, i)=>{
        //check if in our selectedids and remove if so
        if(ids.filter((id, p)=> ( task.t_id == id) ).length){
          removedArray.push(result[i]);
          return false;
        }
        return true;
      })
      //Add tasks back in, in the appro spot
      result.splice(endIndex , 0, ...removedArray);
      
      return result;
    }

    const grid = 8;

    const getItemStyle = (isDragging, draggableStyle) => {
      return({
      // some basic styles to make the items look a bit nicer
      userSelect: "none",
      padding: '0px',
      margin: `0 0 1px 0`,

      // change background colour if dragging
      background: isDragging ? "lightgreen" : "grey",
      // styles we need to apply on draggables
      ...draggableStyle,
      top: isDragging ? draggableStyle["top"] - (draggableStyle["top"] * .25) : '',
      left: isDragging ? '1800px' : '',
    })};

    const getListStyle = isDraggingOver => ({
      background: isDraggingOver ? "lightblue" : "rgba(0,0,0,0)",
      padding: grid,
      width: 'auto'
    });

    const onDragEnd = useCallback((result) => {
      //console.log(result);
      // dropped outside the list
      if (!result.destination) {
        return;
      }
      
      if( !(sorters.length == 0 || (sorters[0]['property'] == "priority_order" && sorters[0]['direction'] == "ASC"))){
        cogoToast.error("Cannot reorder with a sorted list. Please order by priority.");
        return;
      }  

      var items = reorderMultiple(taskListTasksSaved, selectedTasks.length > 1 ? selectedTasks : [taskListTasks[result.source.index].t_id], taskListTasks[result.destination.index].priority_order-1);     
      var newTaskIds = items.map((item, i)=> item.t_id);
      TaskLists.reorderTaskList(newTaskIds,taskListToMap.id)
        .then( (ok) => {
                if(!ok){
                  throw new Error("Could not reorder tasklist" + taskListToMap.id);
                }
                cogoToast.success(`Reordered Task List`, {hideAfter: 4});
                //setTaskListTasks(null);
                setTaskListTasksRefetch(true);
                
            })
        .catch( error => {
          cogoToast.error(`Error reordering task list`, {hideAfter: 4});
            console.error(error);
          });
          
    },[sorters,taskListTasksSaved, selectedTasks, taskListTasks])
    // END DND

    const handleClick = useCallback((event, record_id) => {
      
      //TODO If user changes filter to exclude some already selected items, this breaks?
      const selectedIndex = selectedTasks.indexOf(record_id);
      let newSelected = [];
      const row = taskListTasks.filter((row, index)=> row.t_id == record_id);
      if(row == []){
        error.log("No row found in filteredRows");
      }

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selectedTasks, record_id);
        
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selectedTasks.slice(1));
        
      } else if (selectedIndex === selectedTasks.length - 1) {
        newSelected = newSelected.concat(selectedTasks.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selectedTasks.slice(0, selectedIndex),
          selectedTasks.slice(selectedIndex + 1),
        );
        var tempArray = [];
      }
    
      setSelectedTasks(newSelected);

    },[selectedTasks, taskListTasks]);


    //Add/Swap Popover for crews
    const handleOpenAddMemberPopover = (event, job, crew, type, task) =>{
        if(! (type == "install" || type == "drill")){
          cogoToast.error("Failed to add/update crew job")
          console.error("Faile to add/update crew job on type");
          return;
        }
        
        let job_id = job;
        let crew_id = crew;
        //set to -1 so we know we should add instead of swap or error
        if(job_id == null){
          job_id = -1;
        }
        if(crew_id == null){
          crew_id = -1
        }
        setAddSwapCrewAnchorEl(event.currentTarget);
        setAddSwapCrewJob({job_id : job_id, job_type: type, crew_id: crew_id, task_id: task});
        event.stopPropagation();
    }
    const handleAddMemberPopoverClose = () => {
        setAddSwapCrewAnchorEl(null);
        setAddSwapCrewJob(null);
    };

    //Swap Crews  
    const addSwapCrewPopoverOpen = Boolean(addSwapCrewAnchorEl);
    const addSwapCrewPopoverId = open ? 'add-popover' : undefined;

    const handleAddSwapCrew = useCallback((event, new_crew, old_crew_id) => {
        if(!new_crew.id || !addSwapCrewJob || !addSwapCrewJob.job_id || !addSwapCrewJob.job_type ){
          cogoToast.error("Could not swap.");
          console.error("Bad member or addSwapCrewJob for add/update.");
          return;
        }
        console.log(new_crew.id);
        console.log(addSwapCrewJob);
        // Update Job
        if(addSwapCrewJob.crew_id != -1){
          if(!old_crew_id){
            console.error("No old_crew_id given to handleAddSwapCrew");
          }
          //Update Function
          const updateJob = (id, old_crew_id)=>{
              Crew.updateCrewJob(id, addSwapCrewJob.job_id, old_crew_id)
                      .then((data)=>{
                          setShouldResetCrewState(true);
                          setTaskListTasksRefetch(true)
                      })
                      .catch((error)=>{
                          console.error(error);
                          cogoToast.error("Failed to swap jobs");
              });
          }

          //Dalete Function
          const deleteJob = (id, old_crew_id)=>{
            Crew.deleteCrewJob(id, old_crew_id)
                    .then((data)=>{
                        setShouldResetCrewState(true);
                        //setTaskListTasks(null);
                        setTaskListTasksRefetch(true)
                    })
                    .catch((error)=>{
                        console.error(error);
                        cogoToast.error("Failed to swap jobs");
            });
        }

          //if we have to create new crew and update job
          if(new_crew.id == -1 ){
              Crew.addNewCrew()
              .then((data)=>{
                  if(!isNaN(data)){
                      var id = data;
                      //Update Job
                      updateJob(id,old_crew_id);
                  }
              })
              .catch((error)=>{
                  console.error("handleAddOrCreateCrew", error);
                  cogoToast.error("Failed to Create and Add to Crew");
              })
              
          }else{
            if(new_crew.id == -2){
              //Delete
              deleteJob(addSwapCrewJob.job_id, old_crew_id)
            }else{
              //Just Update
              updateJob(new_crew.id, old_crew_id);
            }
            
          }
          
        }
        
        
        //Create Job 
        if(addSwapCrewJob.crew_id == -1){
          //add job function
          const addJobs = (id) => {
            Crew.addCrewJobs([addSwapCrewJob.task_id], addSwapCrewJob.job_type, id)
                .then((response)=>{
                    if(response){
                        cogoToast.success("Created and added to crew");
                        //setTaskListTasks(null);
                        setTaskListTasksRefetch(true);
                        setShouldResetCrewState(true);
                    }
                })
                .catch((err)=>{
                    console.error("Failed to add to creww", err);
                })
          }

          //If we need to create new crew
          if(new_crew.id == -1 ){
              //Add Crew + return id
              Crew.addNewCrew()
              .then((data)=>{
                  if(!isNaN(data)){
                      var id = data;
                      //Add Jobs
                      addJobs(id);
                  }
              })
              .catch((error)=>{
                  console.error("handleAddOrCreateCrew", error);
                  cogoToast.error("Failed to Create and Add to Crew");
              })
              //Just add from existing crew
          }else{
              addJobs(new_crew.id);
          }
        }
        if(addSwapCrewPopoverOpen){
          handleAddMemberPopoverClose();
        }
        
    },[addSwapCrewJob])
    //// END OF Add/Swap Popover for crews

    const woistatusPopoverOpen = Boolean(woiStatusAnchorEl);
    const woiStatusPopoverId = open ? 'status-popover' : undefined;

    const handleOpenWoiStatusPopover = (event, statusRows) =>{
      if(!statusRows){
        console.warn("No status rows in popover");
        return;
      }
      setWoiStatusRows(statusRows);
      setWoiStatusAnchorEl(event.currentTarget);
      
      event.stopPropagation();
    }
    const handleWoiStatusPopoverClose = () => {
        setWoiStatusAnchorEl(null);
        
    };
    

    const isSelected = useCallback((record_id) => selectedTasks.indexOf(record_id) !== -1,[taskListTasks, selectedTasks]);

    const indexFromPriorityOrder = priority => {
      var ind = taskListTasksSaved.map((task,i)=>task.priority_order).indexOf(priority);

      return ind;
    }

    const indexFromDnDList = dndIndex =>{
      if(!taskListTasks || isNaN(dndIndex)){
        console.error("Error in indexFromDnDList")
        return -1;
      }
      console.log("dndindex", dndIndex);
      console.log("tasklisttasks, could be diff order", taskListTasks);
      console.log("task from indexfromdndlist", taskListTasks[dndIndex])
      let dndTask = taskListTasks[dndIndex].priority_order;
      if(isNaN(dndTask)){
        console.error("Error in indexFromDnDList")
        return -1;
      }

      return dndTask;
    }

    const handleUpdateTaskDate = useCallback((value, task, fieldId) =>{
      if(!task){
        console.error("No task, Failed to update", task);
      }

      var updateTask = {...task};

      updateTask[fieldId] = Util.convertISODateToMySqlDate(value);
      console.log("Update task", updateTask);
      Tasks.updateTask(updateTask)
      .then((data)=>{
        cogoToast.success(`Updated ${fieldId}`)
        setTaskListTasksRefetch(true);
      })
      .catch((error)=>{
        console.error("Failed to update task", error);
        cogoToast.error("Failed to update task");
      })

    },[taskListTasks])

    const handleGoToWorkOrderId = (wo_id, event) =>{
      console.log("woi", wo_id);
      //Disable Default context menu
      event.preventDefault();
      
      //set detailWOIid in local data
      window.localStorage.setItem('detailWOid', JSON.stringify(wo_id));
      
      //set detail view in local data
      window.localStorage.setItem('currentView', JSON.stringify("woDetail"));
  
      Router.push('/scheduling/work_orders')
    }


    const handleSpecialTableValues = useCallback((fieldId, value, type, task) =>{
      if(fieldId == null || task == null){
        console.error("Bad fieldId or task in handleSpecialTableValues");
        return;
      }
      if(type == null){
        console.error("Bad type in handleSpecialTableValues");
        return;
      }

      var return_value = value;

      //Handle date types first
      if(type=="date"){
        return_value = moment(value).format("MM/DD/YYYY")
      }

      switch(fieldId){
        case 'install_crew':{
          if(!task.install_job_completed){
            if(task.install_crew_leader != null){
              return_value = <div className={classes.popOverDiv} 
                                  onMouseUp={event => handleOpenAddMemberPopover(event, task.install_job_id, task.install_crew, "install", task.t_id)}>
                              {task.install_crew_leader}
                            </div>;
            }else{
              return_value = <div className={classes.popOverDiv} 
                              onMouseUp={event => handleOpenAddMemberPopover(event, task.install_job_id, task.install_crew, "install", task.t_id)}>
                                { value ? 'Crew ' + value.toString() : <>&nbsp;</> }
                              </div>;
            }
            break;
          }else{
            if(task.install_crew_leader != null){
              return_value = <span>{task.install_crew_leader}</span>;
            }else{
              return_value = <span>{ value ? 'Crew ' + value.toString() : <>&nbsp;</> }</span>;
            }
            break;
          }
        }
        case 'drill_crew':{
          if(task.type === "Install (Drill)"){
            if(!task.drill_job_completed){
              if(task.drill_crew_leader != null){
                return_value = <div className={classes.popOverDiv} 
                                onMouseUp={event => handleOpenAddMemberPopover(event, task.drill_job_id, task.drill_crew, "drill", task.t_id)}>
                                  {task.drill_crew_leader}
                                </div>;
              }else{
                return_value = <div className={classes.popOverDiv} 
                                onMouseUp={event => handleOpenAddMemberPopover(event, task.drill_job_id, task.drill_crew,"drill", task.t_id)}>
                                  { value ? 'Crew ' + value.toString() : <>&nbsp;</> }
                                </div>;
              }
              break;
            }else{
              if(task.drill_crew_leader != null){
                return_value = <span> {task.drill_crew_leader} </span>;
              }else{
                return_value = <span>
                                  { value ? 'Crew ' + value.toString() : <>&nbsp;</> }
                                </span>;
              }
              break;
            }
          }else{
            return_value = <></>;
            break;
          }
        }
        case 'drill_date':{
          if(task.type === "Install (Drill)"){
            if(!task.drill_job_completed){
              return_value = <div><MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker     format="MM/dd/yyyy" showTodayButton
                            clearable
                            inputVariant="outlined"
                            variant="modal" 
                            maxDate={new Date('01-01-2100')}
                            minDate={new Date('01-01-1970')}
                            className={classes.datePicker}
                            value={value} 
                            onChange={value => handleUpdateTaskDate(value, task, "drill_date")} />
                    </MuiPickersUtilsProvider></div>
              break;
            }else{
              return_value = <span>Completed</span>
              break;
            }
          }else{
            return_value = <></>;
            break;
          }
          
        }
        case 'sch_install_date':{
          if(!task.install_job_completed){
            return_value = <div><MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker     format="MM/dd/yyyy" showTodayButton
                            clearable
                            inputVariant="outlined"
                            variant="modal" 
                            maxDate={new Date('01-01-2100')}
                            minDate={new Date('01-01-1970')}
                            className={classes.datePicker}
                            value={value} 
                            onChange={value => handleUpdateTaskDate(value, task, "sch_install_date")} />
                    </MuiPickersUtilsProvider></div>
                    break;
          }else{
            return_value = <span>Completed</span>
            break;
          }
        }
        case 'woi_status_check':{
          return_value = <WoiStatusCheck handleOpenWoiStatusPopover={handleOpenWoiStatusPopover} 

                          task={task} 
                          data={woiData?.filter((item)=>item.work_order == task.table_id)}/>
          break;
        }
        case 'table_id':
          return_value = <span onContextMenu={(event)=>handleGoToWorkOrderId(value,event)} 
                                className={classes.clickableWOnumber}
                                onClick={event => handleRightClick(event, task.t_id)}>
                                  {value}</span>
        
          break;
        default:{
          
        }
      }

      if(return_value == null || return_value == ""){
        return <>&nbsp;</>;
      }
      return return_value
    },[taskListTasks, woiData])


    return(
        <React.Fragment>
        { taskListTasks && taskListTasksSaved ? <>
        <div ref={targetRef}>
          <TaskListTasksRows taskListTasks={taskListTasks} taskListTasksSaved={taskListTasksSaved} taskListTasksRefetch={taskListTasksRefetch}
           classes={classes} isSelected={isSelected} 
                handleRightClick={handleRightClick} handleClick={handleClick} taskListToMap={taskListToMap} getItemStyle={getItemStyle}
          tableInfo={tableInfo} handleSpecialTableValues={handleSpecialTableValues} addSwapCrewAnchorEl={addSwapCrewAnchorEl} 
          addSwapCrewJob={addSwapCrewJob} addSwapCrewPopoverId={addSwapCrewPopoverId} addSwapCrewPopoverOpen={addSwapCrewPopoverOpen}
          handleAddMemberPopoverClose={handleAddMemberPopoverClose} allCrews={allCrews} handleAddSwapCrew={handleAddSwapCrew}
          onDragEnd={onDragEnd} selectedTasks={selectedTasks} dimensions={dimensions}
          woiStatusAnchorEl={woiStatusAnchorEl} woiStatusPopoverId={woiStatusPopoverId} woiStatusRows={woiStatusRows}
           woistatusPopoverOpen={woistatusPopoverOpen} handleWoiStatusPopoverClose={handleWoiStatusPopoverClose} woiData={woiData}/>
          </div> </>
     : <></>}
        </React.Fragment>
    );

}
export default TaskListTasks;

const TaskListTasksRows = React.memo( ({taskListTasks,taskListTasksSaved,taskListTasksRefetch, classes, isSelected, 
  handleRightClick, handleClick, taskListToMap, getItemStyle,
  tableInfo, handleSpecialTableValues, addSwapCrewAnchorEl, addSwapCrewJob, addSwapCrewPopoverId, addSwapCrewPopoverOpen,
  handleAddMemberPopoverClose, allCrews, handleAddSwapCrew,onDragEnd, selectedTasks, dimensions,
  woiStatusAnchorEl, woiStatusPopoverId, woiStatusRows, woistatusPopoverOpen, handleWoiStatusPopoverClose, woiData})=>{

  const getListStyle =  isDraggingOver => ({
    background: isDraggingOver ? "lightblue" : "rgba(0,0,0,0)",
    padding: grid,
    width: 'auto'
  });

  const grid = 8;

  //For generating keys, so that the list will rerender on crewJobs and crewJobsRefetch
  const getRand = React.useMemo(() => Math.floor((Math.random() * 100) + 1),[taskListTasks, taskListTasksRefetch]);

  const getRowRender = (tasks) => ({ index, style }) => {
    const row = tasks[index];

    if (!row) {
      return null;
    }
    
    if(row['filter']){
      return (<></>);
    }
    const isItemSelected = isSelected(row.t_id);
    const labelId = `checkbox-list-label-${row.t_id}`;
    const isItemCompleted = row.completed_wo == 1;

    return (
      <Draggable key={row.t_id + getRand} 
                  draggableId={(row.priority_order-1).toString()} 
                  index={index} 
                  isDragDisabled={ selectedTasks.length > 0 ? (isItemSelected ? false : true ) : false }>
        {(provided, snapshot) => (
          <div key={taskListTasksSaved[index]?.t_id + 321321 } 
                    role={undefined} dense button 
                    
                    //onMouseUp={event => handleClick(event, row.t_id)}
                    className={ index % 2 == 0 ? 
                              (isItemCompleted ? ( isItemSelected ? classes.selectedRowComp : classes.nonSelectedRowComp ):( isItemSelected ? classes.selectedRow : classes.nonSelectedRow ) )
                              : 
                              (isItemCompleted ? ( isItemSelected ? classes.selectedRowOffsetComp : classes.nonSelectedRowOffsetComp) : ( isItemSelected ? classes.selectedRowOffset : classes.nonSelectedRowOffset))}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    // style={getItemStyle(
                    //   snapshot.isDragging,
                    //   provided.draggableProps.style
                    // )}
                    style={{ ...getItemStyle(
                         snapshot.isDragging,
                         provided.draggableProps.style),
                         ...style}}
                    >
          { taskListToMap 
          ? <div className={classes.checkBoxDiv}>
              <Checkbox checked={isItemSelected} className={classes.tli_checkbox} onClick={event => handleClick(event, row.t_id)}/>
            </div> 
          : <></>}
          {tableInfo.map((item, i)=>{
            var value = row[item.field];
            
            return( 
            <div id={labelId}
                          key={item.field + i}
                          className={item.style ?   classes[item.style] : classes.listItemTextStyle} 
                          style={{flex: `0 0 ${item.width}`}}
                          classes={item.style ?  {primary: classes[item.style]} : {}}>
                           <span> { handleSpecialTableValues(item.field, value, item.type,row)}</span>
            </div>
            
          )})}
          { taskListToMap 
          ? 
          <>            
                {/* <React.Fragment>
                  <IconButton edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.t_id)}>
                  <EditIcon />
                  </IconButton>
                </React.Fragment>
            &nbsp;&nbsp;&nbsp; */}
          </>
          : <></>}
        </div>
        )}
      </Draggable>
    );
  };



  return(
      <React.Fragment>
      { taskListTasks && taskListTasksSaved ? <>
      {/* <List className={classes.root}>   */}
          <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable" mode="virtual"
          renderClone={(provided, snapshot, rubric) => (
            <div
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
            >
              <div key={rubric.source.index} 
                              role={undefined} dense button 
                              className={classes.nonSelectedRow}
                              >
                    <span className={classes.draggingListItemTextStyle}>
                          {taskListTasks[rubric.source.index].t_id} | {taskListTasks[rubric.source.index].t_name} 
                    </span>
                  </div>
            </div>
          )}>
          {(provided, snapshot) => { 
              const itemCount = snapshot.isUsingPlaceholder
              ? taskListTasks.length + 1
              : taskListTasks.length;
            return(
              <List
              height={dimensions?.height - 20}
              rowCount={itemCount}
              rowHeight={26}
              width={dimensions?.width}
              ref={(ref) => {
                // react-virtualized has no way to get the list's ref that I can so
                // So we use the `ReactDOM.findDOMNode(ref)` escape hatch to get the ref
                if (ref) {
                  // eslint-disable-next-line react/no-find-dom-node
                  const whatHasMyLifeComeTo = ReactDOM.findDOMNode(ref);
                  if (whatHasMyLifeComeTo) {
                    provided.innerRef(whatHasMyLifeComeTo);
                  }
                }
              }}
              rowRenderer={getRowRender(taskListTasks)}
            />);
          }
        } 
      </Droppable>
    </DragDropContext>
      {/* </List> */}
            <Popover
            id={addSwapCrewPopoverId}
            open={addSwapCrewPopoverOpen}
            anchorEl={addSwapCrewAnchorEl}
            onClose={handleAddMemberPopoverClose}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
            }}
            className={classes.popover}
            classes={{paper: classes.popoverPaper}}
        >
            <MUIList 
                subheader={
                    <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                        Add/Update Crew
                    </ListSubheader>
                }>
                  { addSwapCrewJob && addSwapCrewJob.crew_id &&
                    <ListItem className={classes.crew_list_item} onMouseUp={(event)=>handleAddSwapCrew(event, {id: -2})}>
                    <ListItemText button primary={'*Remove Crew*'}/>
                    </ListItem>
                  }
                  <ListItem className={classes.crew_list_item} onMouseUp={(event)=>handleAddSwapCrew(event, {id: -1})}>
                          <ListItemText button primary={'*Create New*'}/>
                      </ListItem>
                {addSwapCrewJob && addSwapCrewJob.crew_id && allCrews && allCrews.filter((fil_crew, i)=>{
                              return(fil_crew.id != addSwapCrewJob.crew_id || addSwapCrewJob.crew_id == -1)
                          }).map((crew, i)=>(
                          <ListItem className={classes.crew_list_item} 
                                      key={`crew_members+${i}`} button
                                      onMouseUp={(event)=>handleAddSwapCrew(event, crew, addSwapCrewJob.crew_id )}>
                              <ListItemText primary={crew.crew_leader_name ? crew.crew_leader_name : 'Crew ' + crew.id} />
                          </ListItem>
                      ))}
            </MUIList>
        </Popover> 
        {woiData && <Popover
            id={woiStatusPopoverId}
            open={woistatusPopoverOpen}
            anchorEl={woiStatusAnchorEl}
            onClose={handleWoiStatusPopoverClose}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
            }}
            className={classes.popover}
            classes={{paper: classes.popoverPaperWoi}}
        >
           <div className={classes.woiPopoverContainer}>
             <div className={classes.closeButton} onClick={event => handleWoiStatusPopoverClose()}><CloseIcon/><span>Close</span></div>
              
              <div className={classes.woiPopoverHeadDiv}>
                <span className={classes.woiPopoverSpanTitleHead}>WARNING</span>
                <span className={classes.woiPopoverSpanDescriptionHead}>INFO</span>
                <span className={classes.woiPopoverSpanSignHead}>SIGN</span>
                <span className={classes.woiPopoverSpanDateHead}>DATE</span>
              </div>  
            { woiStatusRows.map((item,i)=> 
            <div className={classes.woiPopoverDiv}>
              <span className={classes.woiPopoverSpanTitle}>{i+1}. {item.title}</span>
              <span className={classes.woiPopoverSpanDescription}>{item.description}</span>
              <span className={classes.woiPopoverSpanSign}>{item.sign}</span>
              <span className={classes.woiPopoverSpanDate}>{item.date}</span>
            </div>
            )

            } 
           </div> </Popover>  }
        </>
      : <div>
          <CircularProgress style={{marginLeft: "47%"}}/>
      </div> 
      }   
      </React.Fragment>
  );

})

const useStyles = makeStyles(theme => ({
  root: {
      margin: '0px 0px 0px 0px',
      padding:'0px',
      color: '#535353',
      width: '100%',
  },
  items:{
      color: '#fcfcfc',
  },
  nonSelectedRow:{
    backgroundColor: '#f9f9f9 !important',
    // '&:hover':{
    //   backgroundColor: '#fff !important',
    // },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    // paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  selectedRow:{
    backgroundColor: '#c2e5f5 !important',
    // '&:hover':{
    //   backgroundColor: '#d0bc77 !important',
    // },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    // paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  nonSelectedRowOffset:{
    backgroundColor: '#e9e9e9  !important',
    // '&:hover':{
    //   backgroundColor: '#fff !important',
    // },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    //paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  selectedRowOffset:{
    backgroundColor: '#b8def0  !important',
    // '&:hover':{
    //   backgroundColor: '#d0bc77 !important',
    // },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    //paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  nonSelectedRowComp:{
    backgroundColor: '#ababab !important',
    // '&:hover':{
    //   backgroundColor: '#c1c1c1 !important',
    // },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    //paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  selectedRowComp:{
    backgroundColor: '#ababff !important',
    // '&:hover':{
    //   backgroundColor: '#c1c1c1 !important',
    // },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    //paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  nonSelectedRowOffsetComp:{
    backgroundColor: '#989898b8  !important',
    '&:hover':{
      backgroundColor: '#c1c1c1 !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    //paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  selectedRowOffsetComp:{
    backgroundColor: '#989898b8  !important',
    '&:hover':{
      backgroundColor: '#c1c1c1 !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    //paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  nonSelectedRowPriority:{
    backgroundColor: '#fffbf1 !important',
    '&:hover':{
      backgroundColor: '#fbdfa8 !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    //paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
    cursor: 'default',
    
  },
  nonSelectedRowOffsetPriority:{
    backgroundColor: '#fdf6e8  !important',
    '&:hover':{
      backgroundColor: '#fbdfa8 !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    //paddingRight: '6% !important',
    justifyContent: 'space-around',
    alignItems: 'center',
    cursor: 'default',
  },
  listItemTextStyle:{
    flex: '0 0 11%',
    textAlign: 'center',

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  draggingListItemTextStyle:{
    flex: '0 0 51%',
    textAlign: 'center',

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  boldListItemText:{
    flex: '0 0 11%',
    textAlign: 'center',

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& span':{
      fontFamily: 'sans-serif',
      fontWeight: 600,
      color: '#11254b',
      fontSize: 'small',
    }
  },
  smallListItemText: {
    flex: '0 0 11%',
    textAlign: 'center',

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& span':{
      fontFamily: 'sans-serif',
      color: '#0e0e0e',
      fontSize: 'x-small',
    },
  },
  artSignDrillSmallListItemText:{
    flex: '0 0 11%',
    textAlign: 'center',
    margin: '0px',
    padding: '4px 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    backgroundColor: '#7bffc847',
    '& span':{
      fontFamily: 'sans-serif',
      fontSize: 'x-small',
      backgroundColor: '#ffffff00',
      color: '#0e0e0e'
    },
  },
  drillSmallListItemText: {
    flex: '0 0 11%',
    textAlign: 'center',
    margin: '0px',
    //padding: '4px 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    backgroundColor: '#efefef',
    '& span':{
      fontFamily: 'sans-serif',
      fontSize: 'x-small',
      backgroundColor: '#ffffff00',
      color: '#0e0e0e'
    },
    
  },
  installSmallListItemText: {
    flex: '0 0 11%',
    textAlign: 'center',
    margin: '0px',
    padding: '4px 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    // backgroundColor: '#ffb87b73',
    '& span':{
      fontFamily: 'sans-serif',
      fontSize: 'x-small',
      backgroundColor: '#ffffff00',
      color: '#0e0e0e'
    },
  },
  no_tasks_info_div:{
    padding: '2%',
    backgroundColor: '#ffc7c7b8',
  },
  no_tasks_info_text:{
    fontSize:' 25px',
  },
  checkBoxDiv:{
    flex: '0 0 2%',
  },
  tli_checkbox:{
    padding: '2px',
  },
  popOverDiv:{
    border: '1px solid #a9a9a9',
    backgroundColor: '#fff',
    '&:hover':{
      boxShadow: '0px 0px 4px 0px black',
      cursor: 'pointer',
      backgroundColor: '#b1b1b159',
    }
  },
  popoverPaperWoi:{
    width: '600px',
    borderRadius: '10px',
    backgroundColor: '#6f6f6f',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  popoverPaper:{
    width: '200px',
    borderRadius: '10px',
    backgroundColor: '#6f6f6f',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  crew_list_item:{
    backgroundColor: '#f9ebca',
    '&:hover':{
        backgroundColor: '#e9c46c',
        color: '#404654',
    },
    padding: '0% 5%',
    border: '1px solid #b2b2b2',
  },
  list_head:{
    lineHeight: '24px',
    borderRadius: '5px',
    color: '#fff',
    backgroundColor: '#61a4a1',
  },
  datePicker:{
    '& input':{
        textAlign: 'center',
        cursor: 'pointer',
        padding: '1px 0px 0px 0px',
        backgroundColor: '#f5fdff',
    }
  },
  woiPopoverContainer:{
    padding: 13,
    background: '#fff'
  },
  woiPopoverHeadDiv:{
    display: 'flex',
    flexDiection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #cecece',
    textAlign: 'center'
  },
  woiPopoverDiv:{
    display: 'flex',
    flexDiection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #cecece',
  },
  woiPopoverSpanTitle:{
    fontFamily: 'sans-serif',
    color: '#000',
    flexBasis: '20%',
    fontWeight: '600',
    
  },
  woiPopoverSpanDescription:{
    fontFamily: 'sans-serif',
    color: '#333',
    flexBasis: '25%'
  },
  woiPopoverSpanSign:{
    flexBasis: '28%'
  },
  woiPopoverSpanDate:{
    flexBasis: '12%'
  },
  closeButton:{
    cursor: 'pointer',
    '&:hover':{
      textDecoration: 'underline'
    },
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
    marginBottom: '5px',
  },
  woiPopoverSpanTitleHead:{
    flexBasis: '20%',
  },
  woiPopoverSpanDescriptionHead:{
    flexBasis: '25%'
  },
  woiPopoverSpanSignHead:{
    flexBasis: '28%'
  },
  woiPopoverSpanDateHead:{
    flexBasis: '12%'
  },
  clickableWOnumber:{
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover':{
      color: '#ee3344',
    }
  },
  

}));