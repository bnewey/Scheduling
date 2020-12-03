import React, {useRef, useState, useEffect, useContext} from 'react';


import {makeStyles, List, ListItem, ListItemSecondaryAction, ListItemText,IconButton, Switch} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import cogoToast from 'cogo-toast';

import clsx from 'clsx';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Tasks from '../../../../js/Tasks';
import Crew from '../../../../js/Crew';
import TaskLists from '../../../../js/TaskLists';
import {TaskContext} from '../../TaskContainer';
import Util from '../../../../js/Util';


const MapSiderbarCrewJobs = (props) =>{


    //STATE

    //PROPS
    //activeMarkerId / setActiveMarkerId / markedRows passed from MapContainer => MapSidebar => Here
    const { mapRows, setMapRows,activeMarker, setActiveMarker, setShowingInfoWindow, markedRows, setMarkedRows , 
          setModalOpen, setModalTaskId, setResetBounds, infoWeather, setInfoWeather, panelRef, expanded, setExpanded, setActiveVehicle,
          expandedAnimDone, sorters, crewJobs, setCrewJobs ,showCompletedJobs,setShowCompletedJobs } = props;
    
    const { selectedIds, setSelectedIds, taskListToMap, setTaskListToMap, taskListTasksSaved,crewToMap, setCrewToMap} = useContext(TaskContext);
    //CSS
    const classes = useStyles();
    //FUNCTIONS
    const handleToggle = (id, event) => {     
        var job = crewJobs.filter((row, i) => row.id === id)[0];
        setActiveMarker({type: 'crew', item: job});
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
      if(activeMarker?.type === "crew" && activeMarker?.item && expandedAnimDone == true){
        var el = panelRef.current.querySelector("#mapCrewJobItem"+activeMarker.item.id);
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
    },[activeMarker, expanded, expandedAnimDone])


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

    const reorder = (list, startIndex, endIndex) => {
      if(!crewToMap){
      cogoToast.info(`No crew to reorder`, {hideAfter: 4});
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
      if(!crewToMap){
        return;
      }
      // dropped outside the list
      if (!result.destination) {
        return;
      }
  
      const items = reorder(
        crewJobs,
        result.source.index,
        result.destination.index
      );

      var temp = items.map((item, i)=> item.id);
        Crew.reorderCrewJobs(temp,crewToMap.id)
        .then( (ok) => {
            if(!ok){
                throw new Error("Could not reorder crew" + crewToMap.id);
            }
            cogoToast.success(`Reordered Crew Jobs`, {hideAfter: 4});
            setCrewJobs(null);
            setCrewToMap({...crewToMap});
        })
        .catch( error => {
            console.error(error);
            cogoToast.warn(`Could not reorder crew jobs`, {hideAfter: 4});
        });
          
    }
    // END DND


    const handleChangeShowComp = (event)=>{
      setShowCompletedJobs(event.target.checked);
      setCrewJobs(null);
      event.stopPropagation();
    }

 

    return(
      <>
      { crewJobs && crewToMap && <>
                        <div className={classes.showCompletedDiv}>
                          <span className={classes.showCompletedSpan}>Show Completed</span>
                          <Switch
                            checked={showCompletedJobs}
                            onChange={event => handleChangeShowComp(event)}
                            name="showCompleted"
                            label="Show Completed"
                          />
                        </div>
                        </>
                    }
        <List  className={classes.root}> 
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable"
            renderClone={(provided, snapshot, rubric) => (
              <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
              >
                <ListItem key={crewJobs[rubric.source.index].id} 
                                role={undefined} dense button 
                                className={classes.nonSelectedRow}
                                >
                      <ListItemText>
                            {crewJobs[rubric.source.index].id} | {crewJobs[rubric.source.index].t_name} 
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
            { crewJobs && crewJobs.map((row, index) => {
                const labelId = `checkbox-list-label-${row.id}`;
                const date = row.sch_install_date || row.drill_date || null;
                const datePassed = date && (new Date(date) < new Date());
                const isSelected = activeMarker?.item ? activeMarker.item.id == row.id : false;
                return (
                  <Draggable key={row.id + 123123} 
                            draggableId={row.id.toString()} 
                            index={index} 
                            isDragDisabled={sorters && sorters[0].property != "priority_order"}
                            >
                  {(provided, snapshot) => (
                    <ListItem key={row.id + 123123} 
                                id={"mapCrewJobItem"+row.id}
                                role={undefined} dense button 
                                onClick={event => handleToggle(row.id, event)}
                                onContextMenu={event => handleRightClick(event, row.task_id)}
                                selected={isSelected}
                                className={ clsx( {[classes.selectedRow]: isSelected },
                                    {[classes.nonSelectedRow]: !isSelected},
                                    {[classes.datePassedRow]: !isSelected && datePassed },
                                    {[classes.datePassedSelectedRow]: isSelected && datePassed }
                                    )}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={crewToMap ? getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                ) : {}}>
                            <ListItemText id={labelId} className={classes.listItemText}>
                                    <><div className={classes.task_name_div}><span className={classes.taskNameSpan}>{row.t_name}</span>
                                <span className={classes.taskNameCompSpan}>{row.completed == 1 ? "COMPLETED" : ""}</span></div>
                                    <div className={classes.job_list_task_info}> 
                                            {row.job_type == 'install' ? <><span className={classes.installSpan}>
                                                    INSTALL DATE:</span> <span> {date ? Util.convertISODateToMySqlDate(date) : 'Not Assigned'}
                                                </span></>
                                                : row.job_type == 'drill' ? <><span className={classes.drillSpan}>
                                                    DRILL DATE: </span> <span>{date ? Util.convertISODateToMySqlDate(date) : 'Not Assigned'}</span> </>
                                                    : 'BAD TYPE'}
                                            &nbsp;<span>{datePassed ? "DATE PASSED" : ""}</span>
                                        </div></>
                            </ListItemText>
                      <ListItemSecondaryAction>
                        { activeMarker?.item && activeMarker.item.id === row.id ? 
                            <React.Fragment>
                              <IconButton edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.task_id)}>
                              <EditIcon />
                              </IconButton>
                              
                              {/* <IconButton edge="end" aria-label="delete" onClick={event => handleRemoveFromSelected(event, activeMarker.item.id)}>
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
        </>
    );

}
export default MapSiderbarCrewJobs;


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
        border: '1px solid #fbff08',
        backgroundColor: '#bff6ff !important',
        '&:hover':{
            border: '1px solid #fbff08',
        },
        boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
    },
    nonSelectedRow:{
        border: '1px solid #91979c',
        backgroundColor: '#fff !important',
        '&:hover':{
            border: '1px solid #ececec',
        },
        boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
    },
    datePassedRow:{
        backgroundColor: '#bbb !important',
    },
    datePassedSelectedRow:{
        backgroundColor: '#b6d1d6 !important',
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
    task_name_div:{
        display:'flex',
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:'center'
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
        '& span':{
            fontWeight: '500',
        }
    },
    installSpan:{
      color: '#e25e00',
    },
    drillSpan:{
        color: '#216fac',
    },
    listItemText:{
      marginTop: 0,
      marginBottom: 0,
    },
    showCompletedDiv:{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#cef3eb',
    },
    showCompletedSpan:{
      fontSize: '.8em',
      fontFamily: 'sans-serif',
      color: '#333'
    }
}));