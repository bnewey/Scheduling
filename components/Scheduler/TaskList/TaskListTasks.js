import React, {useRef, useState, useEffect} from 'react';

import {makeStyles, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Checkbox, IconButton, CircularProgress} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import TaskLists from '../../../js/TaskLists';
import cogoToast from 'cogo-toast';




const TaskListTasks = (props) =>{


    //STATE

    //PROPS
    const { taskListTasks, setTaskListTasks, openTaskList, setOpenTaskList , setModalOpen, setModalTaskId, table_info} = props;
    
    //CSS
    const classes = useStyles();
    // //FUNCTIONS


    useEffect( () =>{ //useEffect for inputText
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
                    var temp = taskListTasks.filter((task, i)=>task.t_id != id);
                    setTaskListTasks(temp);
                    cogoToast.success(`Removed task ${id} from Task List`, {hideAfter: 4});
                })
            .catch( error => {
            console.warn(JSON.stringify(error, null,2));
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

    const grid = 8;

    const getItemStyle = (isDragging, draggableStyle) => {
      return({
      // some basic styles to make the items look a bit nicer
      userSelect: "none",
      padding: '2px',
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
  
      const items = reorder(
        taskListTasks,
        result.source.index,
        result.destination.index
      );
      
      var temp = items.map((item, i)=> item.t_id);
      TaskLists.reorderTaskList(temp,openTaskList.id)
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
                  const labelId = `checkbox-list-label-${row.t_id}`;
                  return (
                    <Draggable key={row.t_id + 321321} 
                                draggableId={row.t_id.toString()} 
                                index={index} 
                                isDragDisabled={ openTaskList && openTaskList.is_priority ? true : false}
                    >
                    {(provided, snapshot) => (
                      <ListItem key={row.t_id + 321321} 
                                  role={undefined} dense button 
                                  onContextMenu={event => handleRightClick(event, row.t_id)}
                                  className={ index % 2 == 0 ? 
                                            ( openTaskList && openTaskList.is_priority ? classes.nonSelectedRowPriority : classes.nonSelectedRow )
                                            : 
                                            (openTaskList && openTaskList.is_priority ? classes.nonSelectedRowOffsetPriority : classes.nonSelectedRowOffset)}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}>
                        {table_info.map((item, i)=>(
                          <ListItemText id={labelId} 
                                        className={classes.listItemTextStyle} 
                                        style={{flex: `0 0 ${item.width}`}}
                                        classes={item.style ?  {primary: classes[item.style]} : {}}>
                                    {row[item.field]}
                          </ListItemText>
                        ))}
                        { openTaskList && !openTaskList.is_priority 
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
  },
  draggingListItemTextStyle:{
    flex: '0 0 51%',
    textAlign: 'center',
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
  }
}));