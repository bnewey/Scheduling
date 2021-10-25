import React, {useRef, useState, useEffect, useContext, useLayoutEffect} from 'react';


import {makeStyles, List, ListItem, ListItemSecondaryAction, ListItemText,IconButton} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import cogoToast from 'cogo-toast';


import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Tasks from '../../../../js/Tasks';
import TaskLists from '../../../../js/TaskLists';
import {TaskContext} from '../../TaskContainer';
import Util from '../../../../js/Util';


const MapSiderbarMarkedTasks = (props) =>{


    //STATE

    //PROPS
    //activeMarkerId / setActiveMarkerId / markedRows passed from MapContainer => MapSidebar => Here
    const { mapRows, setMapRows,activeMarker, setActiveMarker, setShowingInfoWindow, markedRows, setMarkedRows , 
          setModalOpen, setModalTaskId, setResetBounds, infoWeather, setInfoWeather, panelRef, tabValue, setTabValue, 
          expandedAnimDone, setExpandedAnimDone, sorters } = props;
    
    const { selectedIds, setSelectedIds, taskListToMap, setTaskListToMap, taskListTasksSaved, user} = useContext(TaskContext);
    //CSS
    const classes = useStyles();
    //FUNCTIONS
    const handleToggle = (id, event) => {     
        var task = markedRows.filter((row, i) => row.t_id === id)[0];
        setActiveMarker({type: "task", item: task});
        setShowingInfoWindow(true);
    };

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
      if(activeMarker?.type === "task" && activeMarker?.item && panelRef.current ){
        
        var el = panelRef?.current?.querySelector("#mapMarkedListItem"+activeMarker.item.t_id);
        console.log("Panelref", panelRef.current);
        if(!el){
          console.error("No element for isInViewPort", el);
          console.log(activeMarker);
          return;
        }
        if(!isInViewport(el, panelRef.current)){
          el.scrollIntoView({behavior: "smooth",inline: "nearest"});
        }
        
      }
    },[activeMarker, tabValue, expandedAnimDone, panelRef])



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
    //   if(!taskListToMap){
    //     cogoToast.info(`No active Task List to reorder`, {hideAfter: 4});
    //     return;
    //   }
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
      padding: '3px',
      margin: `0 0 4px 0`,

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
      if(!taskListToMap){
        return;
      }
      // dropped outside the list
      if (!result.destination) {
        return;
      }
  
      var items = reorderMultiple(taskListTasksSaved, [mapRows[result.source.index].t_id], mapRows[result.destination.index].priority_order-1);     
      
      var newTaskIds = items.map((item, i)=> item.t_id);
      TaskLists.reorderTaskList(newTaskIds,taskListToMap.id, user)
        .then( (ok) => {
                if(!ok){
                  throw new Error("Could not reorder tasklist" + taskListToMap.id);
                }
                cogoToast.success(`Reordered Task List`, {hideAfter: 4});
                //refresh tasklist
                setMapRows(null);
            })
        .catch( error => {
            console.error(error);
            cogoToast.warn(`Could not reorder task list`, {hideAfter: 4});
          });
          
    }
    // END DND

 

    return(
        <List   className={classes.root}> 
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable"
            renderClone={(provided, snapshot, rubric) => (
              <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
              >
                <ListItem key={markedRows[rubric.source.index].t_id} 
                                role={undefined} dense button 
                                className={classes.nonSelectedRow}
                                >
                      <ListItemText>
                            {markedRows[rubric.source.index].t_id} | {markedRows[rubric.source.index].t_name} 
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
            {markedRows && markedRows.map((row, index) => {
                const labelId = `checkbox-list-label-${row.t_id}`;
                const isSelected = activeMarker?.item ? activeMarker.item.t_id == row.t_id : false;
                return (
                  <Draggable key={row.t_id + 123123} 
                            draggableId={row.t_id.toString()} 
                            index={index} 
                            isDragDisabled={sorters && sorters[0].property != "priority_order"}
                            >
                  {(provided, snapshot) => (
                    <ListItem key={row.t_id + 123123} 
                                id={"mapMarkedListItem"+row.t_id}
                                role={undefined} dense button 
                                onClick={event => handleToggle(row.t_id, event)}
                                onContextMenu={event => handleRightClick(event, row.t_id)}
                                selected={isSelected}
                                className={isSelected ? classes.selectedRow : classes.nonSelectedRow}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={taskListToMap ? getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                ) : {}}>
                      <ListItemText id={labelId} className={classes.listItemText}>
                            <><div className={classes.MarkerInfo}>{row.t_name}</div>
                            <div className={classes.MarkerSubInfo}>  Priority:&nbsp;{row.priority_order}
                                &nbsp;&nbsp;{row.sch_install_date ? <>I-date:&nbsp;{Util.convertISODateToMySqlDate(row.sch_install_date)}&nbsp;</>: ""}
                                {row.drill_date ? <>D-date:&nbsp;{Util.convertISODateToMySqlDate(row.drill_date)}</> :""} </div></>
                      </ListItemText>
                      <ListItemSecondaryAction>
                        { activeMarker?.item && activeMarker.item.t_id === row.t_id ? 
                            <React.Fragment>
                              <IconButton edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.t_id)}>
                              <EditIcon />
                              </IconButton>
                              
                              {/* <IconButton edge="end" aria-label="delete" onClick={event => handleRemoveFromSelected(event, activeMarker.t_id)}>
                                <DeleteIcon />
                              </IconButton>  */}
                             
                            </React.Fragment>
                          : <div></div>}
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
    );

}
export default MapSiderbarMarkedTasks;


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
    backgroundColor: '#ffffff !important',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
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
    listItemText:{
      marginTop: 0,
      marginBottom: 0,
    }
}));