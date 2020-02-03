import React, {useRef, useState, useEffect} from 'react';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../UI/ConfirmYesNo';

import CircularProgress from '@material-ui/core/CircularProgress';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import TaskLists from '../../../js/TaskLists';



const useStyles = makeStyles(theme => ({
    root: {
        margin: '10px 0px 10px 0px',
        color: '#535353',
        width: '100%',
    },
    items:{
        color: '#fcfcfc'
    },
    selectedRow:{
      backgroundColor: '#abb7c9 !important',
      boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
    },
    nonSelectedRow:{
      backgroundColor: '#f0fbff !important',
      boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
    }
  }));

const TaskListTasks = (props) =>{


    //STATE

    //PROPS
    const {taskLists, taskListTasks, setTaskListTasks, mapRows, setMapRows, activeTaskList, setActiveTaskList , setModalOpen, setModalTaskId, 
              selectedIds, setSelectedIds} = props;
    
    //CSS
    const classes = useStyles();
    // //FUNCTIONS


    useEffect( () =>{ //useEffect for inputText
        return () => { //clean up
            
            if(activeTaskList){
                //setTaskListTasks(null);
                //doesnt run currently
            }
        }
      },[taskListTasks]);


    const handleRemoveFromTaskList = (event, id, name) => {
      const remove = () => {
        TaskLists.removeTaskFromList(id)
            .then( (data) => {
                    var temp = taskListTasks.filter((task, i)=>task.t_id != id);
                    setTaskListTasks(temp);
                })
            .catch( error => {
            console.warn(JSON.stringify(error, null,2));
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
      padding: grid * 1,
      margin: `0 0 ${grid}px 0`,

      // change background colour if dragging
      background: isDragging ? "lightgreen" : "grey",
      // styles we need to apply on draggables
      ...draggableStyle,
      top: isDragging ? draggableStyle["top"] - (draggableStyle["top"] * .25) : '',
      left: isDragging ? '1800px' : '',
    })};

    const getListStyle = isDraggingOver => ({
      background: isDraggingOver ? "lightblue" : "lightgrey",
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
      
      console.log(items);
      
      var temp = items.map((item, i)=> item.t_id);
      TaskLists.reorderTaskList(temp,activeTaskList.id)
        .then( (ok) => {
                if(!ok){
                  console.warn("Could not reorder tasklist" + activeTaskList.id);
                }
                setTaskListTasks(null);
            })
        .catch( error => {
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
                      <ListItemText>
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
            {taskListTasks.map((row, index) => {
                const labelId = `checkbox-list-label-${row.t_id}`;
                return (
                  <Draggable key={row.t_id} draggableId={row.t_id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <ListItem key={row.t_id} 
                                role={undefined} dense button 
                                onContextMenu={event => handleRightClick(event, row.t_id)}
                                className={classes.nonSelectedRow}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                )}>
                      <ListItemText id={labelId}>
                            {row.t_id} | {row.t_name} | {row.priority_order}
                      </ListItemText>
                      <ListItemSecondaryAction>            
                            <React.Fragment>
                              <IconButton edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.t_id)}>
                              <EditIcon />
                              </IconButton>
                              <IconButton edge="end" aria-label="delete" onClick={event => handleRemoveFromTaskList(event, row.t_id, row.t_name)}>
                                <DeleteIcon />
                              </IconButton> 
                            </React.Fragment>
                        &nbsp;&nbsp;&nbsp;
                      </ListItemSecondaryAction>
                    </ListItem>
                    )}
                    </Draggable>
                  );
                  
            })}
            
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