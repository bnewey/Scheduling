import React, {useRef, useState, useEffect} from 'react';

import {makeStyles, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Checkbox, IconButton, CircularProgress, Tooltip} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import TaskLists from '../../../js/TaskLists';
import cogoToast from 'cogo-toast';
import Util from '../../../js/Util';
import { select } from 'async';




const TaskListTasks = (props) =>{


    //STATE
    //PROPS
    const { taskListTasks, setTaskListTasks, taskListToMap , setModalOpen, setModalTaskId, table_info,
              priorityList, setTaskListToMap, setSelectedIds, selectedTasks, setSelectedTasks, taskListTasksSaved} = props;
    
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

      if(value == null){
        return <>&nbsp;</>;
      }

      var return_value = value;

      //Handle date types first
      if(type=="date"){
        return_value = Util.convertISODateToMySqlDate(return_value);
      }

      switch(fieldId){
        case 'install_crew':{
          
          if(task.install_crew_leader != null){
            return_value = task.install_crew_leader;
          }else{
            return_value = 'Crew ' + value.toString();
          }
          break;
        }
        case 'drill_crew':{
          if(task.drill_crew_leader != null){
            return_value = task.drill_crew_leader;
          }else{
            return_value = 'Crew ' + value.toString();
          }
          break;
        }
        default:{
          
        }
      }
      return return_value
    }

    return(
        <React.Fragment>
        { taskListTasks && taskListTasksSaved ? 
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
      fontSize: 'xx-small',
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
      color: '#222'
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
      color: '#222'
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
  }
}));