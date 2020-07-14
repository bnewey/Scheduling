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




const TaskListTasks = (props) =>{


    //STATE
    //PROPS
    const { taskListTasks, setTaskListTasks, openTaskList, setOpenTaskList , setModalOpen, setModalTaskId, table_info,
              priorityList, setTaskListToMap, setSelectedIds, selectedTasks, setSelectedTasks, setMapRows} = props;
    
    //CSS
    const classes = useStyles();
    // //FUNCTIONS


    useEffect( () =>{ //useEffect for inputText
      console.log("Changed");  
      return () => { //clean up
            
            if(openTaskList){
                //setTaskListTasks(null);
                //doesnt run currently
            }
        }
      },[taskListTasks]);


    const handleRemoveFromTaskList = (event, id, tl_id, name) => {
      const remove = () => {
        TaskLists.removeTaskFromList(id, tl_id)
            .then( (data) => {
                    const filtered_rows = taskListTasks.filter((task, i)=>task.t_id != id);
                    setTaskListTasks(filtered_rows);
                    setTaskListToMap(priorityList);
                    setSelectedIds(filtered_rows.map((task,i)=> {return task.t_id}));
                    setMapRows(filtered_rows);
                    cogoToast.success(`Removed task ${id} from Task List`, {hideAfter: 4});
                })
            .catch( error => {
            console.warn("Error removing task",error);
            cogoToast.error(`Error removing Task from Task List`, {hideAfter: 4});
             });
      }
      confirmAlert({
          customUI: ({onClose}) => {
              return(
                  <ConfirmYesNo onYes={remove} onClose={onClose} customMessage={"Remove task: \"" + name + "\" from TaskList?"}/>
              );
          }
      })
    }

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
    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result;
    };

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
      result.splice(endIndex, 0, ...removedArray);

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
      // dropped outside the list
      if (!result.destination) {
        return;
      }
      
      var items;
      if(selectedTasks && selectedTasks.length > 0){
        items = reorderMultiple(taskListTasks, selectedTasks, result.destination.index);
        console.log("MULTUPLE: ", items);
      }else{
        items = reorder(
          taskListTasks,
          result.source.index,
          result.destination.index
        );
        console.log("SINGLE: ", items);
      }
      
      var newTaskIds = items.map((item, i)=> item.t_id);
      console.log("TMP", newTaskIds);
      TaskLists.reorderTaskList(newTaskIds,openTaskList.id)
        .then( (ok) => {
                if(!ok){
                  throw new Error("Could not reorder tasklist" + openTaskList.id);
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

    return(
        <React.Fragment>
        { taskListTasks ? 
        <List className={classes.root}>  
            <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable"
            renderClone={(provided, snapshot, rubric) => (
              <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
              >
                <ListItem key={taskListTasks[rubric.source.index].t_id} 
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
                  
                  return (
                    <Draggable key={row.t_id + 321321} 
                                draggableId={row.t_id.toString()} 
                                index={index} 
                                isDragDisabled={ selectedTasks.length > 0 ? (isItemSelected ? false : true ) : false }
                    >
                    {(provided, snapshot) => (
                      <ListItem key={taskListTasks[index].t_id + 321321} 
                                  role={undefined} dense button 
                                  onContextMenu={event => handleRightClick(event, row.t_id)}
                                  onMouseUp={event => handleClick(event, row.t_id)}
                                  className={ index % 2 == 0 ? 
                                            ( isItemSelected ? classes.selectedRow : classes.nonSelectedRow )
                                            : 
                                            ( isItemSelected ? classes.selectedRowOffset : classes.nonSelectedRowOffset)}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}>
                        { openTaskList 
                        ? <>
                            <Checkbox checked={isItemSelected} className={classes.tli_checkbox}/>
                          </> 
                        : <></>}
                        {table_info.map((item, i)=>{
                          var value;
                          if(item.type == 'date' ){
                            value = Util.convertISODateToMySqlDate(row[item.field]);
                          }else{
                            value = row[item.field];
                          }
                          return( <Tooltip title={value} enterDelay={800}>
                          <ListItemText id={labelId}
                                        key={item.field + i}
                                        className={classes.listItemTextStyle} 
                                        style={{flex: `0 0 ${item.width}`}}
                                        classes={item.style ?  {primary: classes[item.style]} : {}}>
                                   { value} 
                          </ListItemText>
                          </Tooltip>
                        )})}
                        { openTaskList 
                        ? 
                        <ListItemSecondaryAction>            
                              <React.Fragment>
                                <IconButton edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.t_id)}>
                                <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={event => handleRemoveFromTaskList(event, row.t_id, row.tl_id, row.t_name)}>
                                  <DeleteIcon />
                                </IconButton> 
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
  selectedRow:{
    backgroundColor: '#abb7c9 !important',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
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
    fontWeight: 600,
    color: '#303d4b',
    fontSize: 'small',
  },
  smallListItemText: {
    fontSize: 'xx-small',
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