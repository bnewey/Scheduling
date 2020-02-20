import React, {useRef, useState, useEffect, useContext} from 'react';


import {makeStyles, List, ListItem, ListItemSecondaryAction, ListItemText,IconButton} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import cogoToast from 'cogo-toast';


import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Tasks from '../../../../js/Tasks';
import TaskLists from '../../../../js/TaskLists';
import {TaskContext} from '../../Table/TaskContainer';


const MapSiderbarMarkedTasks = (props) =>{


    //STATE

    //PROPS
    //activeMarkerId / setActiveMarkerId / markedRows passed from MapContainer => MapSidebar => Here
    const { activeMarker, setActiveMarker, setShowingInfoWindow, markedRows, setMarkedRows , 
          setModalOpen, setModalTaskId, setResetBounds, infoWeather, setInfoWeather, reFetchTaskList, setReFetchTaskList} = props;
    
    const {mapRows, setMapRows, selectedIds, setSelectedIds, taskListToMap, setTaskListToMap} = useContext(TaskContext);
    //CSS
    const classes = useStyles();
    //FUNCTIONS
    const handleToggle = id => () => {     
        var task = markedRows.filter((row, i) => row.t_id === id)[0];
        setActiveMarker(task);
        setShowingInfoWindow(true);
    };

    //move this functionality to tasks instead of marker sidebar / replace with remove from selected


    const handleRemoveFromSelected = (event, record_id) => {
      //if TaskList is active
      if(taskListToMap){
        setTaskListToMap(null);
        cogoToast.info(`Task List: ${taskListToMap.list_name} has been unmapped. You are now working with an unsaved tasks`);
      }

      //TODO If user changes filter to exclude some already selected items, this breaks.
      const selectedIndex = selectedIds.indexOf(record_id);
      let newSelected = [];
      const row = mapRows.filter((row, index)=> row.t_id == record_id);
      if(row == []){
        error.log("No row found in filteredRows");
      }

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selectedIds, record_id);
        setMapRows(mapRows ? mapRows.concat(row) : [row]);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selectedIds.slice(1));
        setMapRows(mapRows.slice(1));
      } else if (selectedIndex === selectedIds.length - 1) {
        newSelected = newSelected.concat(selectedIds.slice(0, -1));
        setMapRows(mapRows.slice(0,-1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selectedIds.slice(0, selectedIndex),
          selectedIds.slice(selectedIndex + 1),
        );
        var tempArray = [];
        setMapRows(
          tempArray.concat(
            mapRows.slice(0,selectedIndex),
            mapRows.slice(selectedIndex + 1),
          )
        );
      }
    
      setSelectedIds(newSelected);
      setInfoWeather(null);
      setShowingInfoWindow(false);
      setResetBounds(true);

    };


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
      if(!taskListToMap){
        cogoToast.info(`No active Task List to reorder`);
        return;
      }
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
      if(!taskListToMap){
        return;
      }
      // dropped outside the list
      if (!result.destination) {
        return;
      }
  
      const items = reorder(
        markedRows,
        result.source.index,
        result.destination.index
      );
      
      var temp = items.map((item, i)=> item.t_id);
      TaskLists.reorderTaskList(temp,taskListToMap.id)
        .then( (ok) => {
                if(!ok){
                  throw new Error("Could not reorder tasklist" + taskListToMap.id);
                }
                cogoToast.success(`Reordered Task List`);
                //refresh tasklist
                setReFetchTaskList(true);
            })
        .catch( error => {
            console.error(error);
            cogoToast.warn(`Could not reorder task list`);
          });
          
    }
    // END DND

    

    return(
        <List className={classes.root}> 
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
            {markedRows.map((row, index) => {
                const labelId = `checkbox-list-label-${row.t_id}`;
                return (
                  <Draggable key={row.t_id} draggableId={row.t_id.toString()} index={index} isDragDisabled={taskListToMap ? false : true}>
                  {(provided, snapshot) => (
                    <ListItem key={row.t_id} 
                                role={undefined} dense button 
                                onClick={handleToggle(row.t_id)}
                                onContextMenu={event => handleRightClick(event, row.t_id)}
                                selected={activeMarker && activeMarker.t_id === row.t_id}
                                className={activeMarker ? (activeMarker.t_id === row.t_id ? classes.selectedRow : classes.nonSelectedRow) : classes.nonSelectedRow}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={taskListToMap ? getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                ) : {}}>
                      <ListItemText id={labelId}>
                            <><div className={classes.MarkerInfo}>{row.t_name}</div>
                            <div className={classes.MarkerSubInfo}>  ID:&nbsp;{row.t_id}&nbsp;&nbsp;Priority:&nbsp;{row.priority_order} </div></>
                      </ListItemText>
                      <ListItemSecondaryAction>
                        { activeMarker && activeMarker.t_id === row.t_id ? 
                            <React.Fragment>
                              <IconButton edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.t_id)}>
                              <EditIcon />
                              </IconButton>
                              
                              <IconButton edge="end" aria-label="delete" onClick={event => handleRemoveFromSelected(event, activeMarker.t_id)}>
                                <DeleteIcon />
                              </IconButton> 
                             
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
}));