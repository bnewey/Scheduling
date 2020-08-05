import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Checkbox, IconButton, CircularProgress, 
  Popover, ListSubheader,Tooltip} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import TaskLists from '../../../js/TaskLists';
import cogoToast from 'cogo-toast';
import Util from '../../../js/Util';
import { select } from 'async';
import { CrewContext } from '../Crew/CrewContextContainer';

import Crew from '../../../js/Crew';


const TaskListTasks = (props) =>{


    //STATE
    //PROPS
    const { taskListTasks, setTaskListTasks, taskListToMap , setModalOpen, setModalTaskId, table_info,
              priorityList, setTaskListToMap, setSelectedIds, selectedTasks, setSelectedTasks, taskListTasksSaved, setTaskListTasksSaved,
              sorters, filters} = props;
    
    const { setShouldResetCrewState, allCrews } = useContext(CrewContext);

    //Popover Add/swap crew
    const [addSwapCrewAnchorEl, setAddSwapCrewAnchorEl] = React.useState(null);
    const [addSwapCrewJob, setAddSwapCrewJob] = useState(null);

    //CSS
    const classes = useStyles();
    // //FUNCTIONS


    useEffect( () =>{ //useEffect for inputText
      console.log("Changed");  
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


    // const handleRemoveFromTaskList = (event, id, tl_id, name) => {
    //   const remove = () => {
    //     TaskLists.removeTaskFromList(id, tl_id)
    //         .then( (data) => {
    //                 const filtered_rows = taskListTasks.filter((task, i)=>task.t_id != id);
    //                 setTaskListTasks(filtered_rows);
    //                 setTaskListToMap(priorityList);
    //                 setSelectedIds(filtered_rows.map((task,i)=> {return task.t_id}));
                    
    //                 cogoToast.success(`Removed task ${id} from Task List`, {hideAfter: 4});
    //             })
    //         .catch( error => {
    //         console.warn("Error removing task",error);
    //         cogoToast.error(`Error removing Task from Task List`, {hideAfter: 4});
    //          });
    //   }
    //   confirmAlert({
    //       customUI: ({onClose}) => {
    //           return(
    //               <ConfirmYesNo onYes={remove} onClose={onClose} customMessage={"Remove task: \"" + name + "\" from TaskList?"}/>
    //           );
    //       }
    //   })
    // }

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

    const onDragEnd = (result) => {
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
                setTaskListTasks(null);
                
            })
        .catch( error => {
          cogoToast.error(`Error reordering task list`, {hideAfter: 4});
            console.error(error);
          });
          
    }
    // END DND

    const handleClick = (event, record_id) => {
      
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

    };


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

    const handleAddSwapCrew = (event, new_crew) => {
        if(!new_crew.id || !addSwapCrewJob || !addSwapCrewJob.job_id || !addSwapCrewJob.job_type){
          cogoToast.error("Could not swap.");
          console.error("Bad member or addSwapCrewJob for add/update.");
          return;
        }
        console.log(new_crew.id);
        console.log(addSwapCrewJob);
        // Update Job
        if(addSwapCrewJob.crew_id != -1){
          //Update Function
          const updateJob = (id)=>{
              Crew.updateCrewJob(id, addSwapCrewJob.job_id)
                      .then((data)=>{
                          setShouldResetCrewState(true);
                          setTaskListTasks(null);
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
                      updateJob(id);
                  }
              })
              .catch((error)=>{
                  console.error("handleAddOrCreateCrew", error);
                  cogoToast.error("Failed to Create and Add to Crew");
              })
              //Just Update
          }else{
              updateJob(new_crew.id);
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
                        setTaskListTasks(null);
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
        
    }
    //// END OF Add/Swap Popover for crews

    const isSelected = record_id => selectedTasks.indexOf(record_id) !== -1;

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



    const handleSpecialTableValues = (fieldId, value, type, task) =>{
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

        return_value = Util.convertISODateToMySqlDate(return_value);
      }

      switch(fieldId){
        case 'install_crew':{
          
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
        }
        case 'drill_crew':{
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
        }
        default:{
          
        }
      }

      if(return_value == null || return_value == ""){
        return <>&nbsp;</>;
      }
      return return_value
    }

    return(
        <React.Fragment>
        { taskListTasks && taskListTasksSaved ? <>
        <List className={classes.root}>  
            <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" 
            renderClone={(provided, snapshot, rubric) => (
              <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
              >
                <ListItem key={rubric.source.index} 
                                role={undefined} dense button 
                                className={classes.nonSelectedRow}
                                >
                      <ListItemText className={classes.draggingListItemTextStyle}>
                            {taskListTasks[rubric.source.index].t_id} | {taskListTasks[rubric.source.index].t_name} 
                      </ListItemText>
                    </ListItem>
              </div>
            )}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >          
              {taskListTasks && taskListTasks.length > 0 ? 
                <> { taskListTasks.map((row, index) => {
                  if(row['filter']){
                    return (<></>);
                  }
                  const isItemSelected = isSelected(row.t_id);
                  const labelId = `checkbox-list-label-${row.t_id}`;
                  const isItemCompleted = row.completed_wo == 1;
                  return (
                    <Draggable key={row.t_id + 321321} 
                                draggableId={(row.priority_order-1).toString()} 
                                index={index} 
                                isDragDisabled={ selectedTasks.length > 0 ? (isItemSelected ? false : true ) : false }
                    >
                    {(provided, snapshot) => (
                      <ListItem key={taskListTasksSaved[index].t_id + 321321} 
                                  role={undefined} dense button 
                                  onContextMenu={event => handleRightClick(event, row.t_id)}
                                  onMouseUp={event => handleClick(event, row.t_id)}
                                  className={ index % 2 == 0 ? 
                                            (isItemCompleted ? ( isItemSelected ? classes.selectedRowComp : classes.nonSelectedRowComp ):( isItemSelected ? classes.selectedRow : classes.nonSelectedRow ) )
                                            : 
                                            (isItemCompleted ? ( isItemSelected ? classes.selectedRowOffsetComp : classes.nonSelectedRowOffsetComp) : ( isItemSelected ? classes.selectedRowOffset : classes.nonSelectedRowOffset))}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}>
                        { taskListToMap 
                        ? <>
                            <Checkbox checked={isItemSelected} className={classes.tli_checkbox}/>
                          </> 
                        : <></>}
                        {table_info.map((item, i)=>{
                          var value = row[item.field];
                          
                          return( <Tooltip title={value} enterDelay={800}>
                          <ListItemText id={labelId}
                                        key={item.field + i}
                                        className={item.style ?   classes[item.style] : classes.listItemTextStyle} 
                                        style={{flex: `0 0 ${item.width}`}}
                                        classes={item.style ?  {primary: classes[item.style]} : {}}>
                                          { handleSpecialTableValues(item.field, value, item.type,row)}
                                   {/* { item.field != "completed_wo" ? value : (value == 0 ? 'NC' : 'Comp') }  */}
                          </ListItemText>
                          </Tooltip>
                        )})}
                        { taskListToMap 
                        ? 
                        <ListItemSecondaryAction>            
                              <React.Fragment>
                                <IconButton edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.t_id)}>
                                <EditIcon />
                                </IconButton>
                                {/* <IconButton edge="end" aria-label="delete" onClick={event => handleRemoveFromTaskList(event, row.t_id, row.tl_id, row.t_name)}>
                                  <DeleteIcon />
                                </IconButton>  */}
                              </React.Fragment>
                          &nbsp;&nbsp;&nbsp;
                        </ListItemSecondaryAction>
                        : <></>}
                      </ListItem>
                      )}
                      </Draggable>
                    );
                    
                 })} </> : 
                 //taskListTasks.length < 0
                 <>
                  <div className={classes.no_tasks_info_div}>
                    <span className={classes.no_tasks_info_text}>
                      No Tasks added to this Task List yet! Click the TASKS tab to add some tasks!
                    </span>
                  </div>
                  </>}
            
            {provided.placeholder}
            </div>
          )} 
        </Droppable>
      </DragDropContext>
        </List>
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
              <List 
                  subheader={
                      <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                          Add/Update Crew
                      </ListSubheader>
                  }>
                    <ListItem className={classes.crew_list_item} onMouseUp={(event)=>handleAddSwapCrew(event, {id: -1})}>
                            <ListItemText button primary={'*Create New*'}/>
                        </ListItem>
                  {addSwapCrewJob && addSwapCrewJob.crew_id && allCrews && allCrews.filter((fil_crew, i)=>{
                                return(fil_crew.id != addSwapCrewJob.crew_id || addSwapCrewJob.crew_id == -1)
                            }).map((crew, i)=>(
                            <ListItem className={classes.crew_list_item} 
                                        key={`crew_members+${i}`} button
                                        onMouseUp={(event)=>handleAddSwapCrew(event, crew)}>
                                <ListItemText primary={crew.crew_leader_name ? crew.crew_leader_name : 'Crew ' + crew.id} />
                            </ListItem>
                        ))}
              </List>
          </Popover> 
          </>
        : <div>
            <CircularProgress style={{marginLeft: "47%"}}/>
        </div> 
        }   
        </React.Fragment>
    );

}
export default TaskListTasks;

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
    backgroundColor: '#dcf6ff !important',
    '&:hover':{
      backgroundColor: '#fff !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    paddingRight: '6% !important',
    justifyContent: 'space-around',
    
  },
  selectedRow:{
    backgroundColor: '#efe0ab !important',
    '&:hover':{
      backgroundColor: '#d0bc77 !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    paddingRight: '6% !important',
    justifyContent: 'space-around',
    
  },
  nonSelectedRowOffset:{
    backgroundColor: '#c5e2f3  !important',
    '&:hover':{
      backgroundColor: '#fff !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    paddingRight: '6% !important',
    justifyContent: 'space-around',
  },
  selectedRowOffset:{
    backgroundColor: '#efe0ab  !important',
    '&:hover':{
      backgroundColor: '#d0bc77 !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    paddingRight: '6% !important',
    justifyContent: 'space-around',
  },
  nonSelectedRowComp:{
    backgroundColor: '#989898b8 !important',
    '&:hover':{
      backgroundColor: '#c1c1c1 !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    paddingRight: '6% !important',
    justifyContent: 'space-around',
    
  },
  selectedRowComp:{
    backgroundColor: '#989898b8 !important',
    '&:hover':{
      backgroundColor: '#c1c1c1 !important',
    },
    border: '1px solid #7c8080',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    display:'flex',
    flexWrap: 'nowrap',
    paddingRight: '6% !important',
    justifyContent: 'space-around',
    
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
    paddingRight: '6% !important',
    justifyContent: 'space-around',
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
    paddingRight: '6% !important',
    justifyContent: 'space-around',
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
    paddingRight: '6% !important',
    justifyContent: 'space-around',
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
    paddingRight: '6% !important',
    justifyContent: 'space-around',
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
      fontWeight: 600,
      color: '#303d4b',
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
      fontSize: 'x-small',
      backgroundColor: '#ffffff00',
      color: '#0e0e0e'
    },
  },
  drillSmallListItemText: {
    flex: '0 0 11%',
    textAlign: 'center',
    margin: '0px',
    padding: '4px 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    backgroundColor: '#ffeacb7a',
    '& span':{
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
    backgroundColor: '#ffb87b73',
    '& span':{
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
  tli_checkbox:{
    position: 'absolute',
    padding: '0px',
    left: '0px',
    '& span':{
      color: '#444',
      '&:hover':{
        color: '#000',
      }
    }
  },
  popOverDiv:{
    border: '1px solid #a9a9a9',

    '&:hover':{
      boxShadow: '0px 0px 4px 0px black',
      cursor: 'pointer',
      backgroundColor: '#b1b1b159',
    }
  },
  popoverPaper:{
    width: '146px',
    borderRadius: '10px',
    backgroundColor: '#6f6f6f',
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

}));