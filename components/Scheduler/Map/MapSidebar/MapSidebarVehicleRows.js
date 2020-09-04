import React, {useRef, useState, useEffect, useContext} from 'react';


import {makeStyles, List, ListItem, ListItemSecondaryAction, ListItemText,IconButton} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import cogoToast from 'cogo-toast';


import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Tasks from '../../../../js/Tasks';
import TaskLists from '../../../../js/TaskLists';
import {TaskContext} from '../../TaskContainer';
import Util from '../../../../js/Util';


const MapSiderbarVehicleRows = (props) =>{


    //STATE

    //PROPS
    //activeVehicleId / setActiveVehicleId / vehicleRows passed from MapContainer => MapSidebar => Here
    const { mapRows, setMapRows,activeVehicle, setActiveVehicle, setActiveMarker, setShowingInfoWindow, vehicleRows, setMarkedRows , 
          setModalOpen, setModalTaskId, setResetBounds, infoWeather, setInfoWeather, vehiclePanelRef, expanded, setExpanded, expandedAnimDone} = props;
    
    const { selectedIds, setSelectedIds, taskListToMap, setTaskListToMap, taskListTasksSaved} = useContext(TaskContext);
    //CSS
    const classes = useStyles();
    //FUNCTIONS
    const handleToggle = (id, event) => {     
        var vehicle = vehicleRows.filter((row, i) => row.vin === id)[0];
        setActiveVehicle(vehicle);
        setShowingInfoWindow(true);
        setActiveMarker(null);
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
      if(activeVehicle && expandedAnimDone == true){
        
        var el = vehiclePanelRef.current.querySelector("#mapVehicleListItem"+activeVehicle.vin);
        if(!el){
          console.error("No element for isInViewPort", el);
          console.log(activeVehicle);
          return;
        }

        if(!isInViewport(el, vehiclePanelRef.current)){
          el.scrollIntoView({behavior: "smooth",inline: "nearest"});
        }
      }
    },[activeVehicle, expanded, expandedAnimDone])

    

    //Modal
    // const handleRightClick = (event, id) => {
    //   setModalTaskId(id);
    //   setModalOpen(true);

    //   //Disable Default context menu
    //   event.preventDefault();
    // };
    ////



    return(
        <List  className={classes.root}> 
        
            {vehicleRows && vehicleRows.map((row, index) => {
                const labelId = `checkbox-list-label-${row.vin}`;
                const isSelected = activeVehicle ? activeVehicle.vin == row.vin : false;
                return (
                  
                  
                    <ListItem key={row.vin + 123123} 
                                id={"mapVehicleListItem"+row.vin}
                                role={undefined} dense button 
                                onClick={event => handleToggle(row.vin, event)}
                                // onContextMenu={event => handleRightClick(event, row.vin)}
                                selected={isSelected}
                                className={isSelected ? classes.selectedRow : classes.nonSelectedRow}
                                >
                      <ListItemText id={labelId}>
                <><div className={classes.MarkerInfo}>{row.name}<span className={classes.activeText}>{row.active ? "ACTIVE": ""}</span></div>
                            <div className={classes.MarkerSubInfo}>   </div></>
                      </ListItemText>
                      <ListItemSecondaryAction>
                        { activeVehicle && activeVehicle.vin === row.vin ? 
                            <React.Fragment>
                              {/* <IconButton edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.vin)}>
                              <EditIcon />
                              </IconButton> */}
                              
                              {/* <IconButton edge="end" aria-label="delete" onClick={event => handleRemoveFromSelected(event, activeVehicle.vin)}>
                                <DeleteIcon />
                              </IconButton>  */}
                             
                            </React.Fragment>
                          : <div></div>}
                        &nbsp;&nbsp;&nbsp;
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                  );
            })}
        </List>
    );

}
export default MapSiderbarVehicleRows;


const useStyles = makeStyles(theme => ({
  root: {
      margin: '10px 0px 10px 0px',
      color: '#535353',
      width: '100%',
  },
  items:{
      color: '#fcfcfc'
  },
  activeText:{
    color: '#4991ff',
    padding: '0px 5px',
  },
  selectedRow:{
    backgroundColor: '#abb7c9 !important',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    border: '1px solid #c7c7c7',
  },
  nonSelectedRow:{
    backgroundColor: '#fff !important',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)',
    border: '1px solid #c7c7c7',
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