import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, List, ListItem, ListItemSecondaryAction, ListItemText, IconButton} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import { TaskContext } from '../../TaskContainer';


const MapSiderbarMissingMakers = (props) =>{
    const {mapRows, setMapRows,activeMarker, setActiveMarker, setShowingInfoWindow, noMarkerRows , setModalOpen, setModalTaskId, setResetBounds,
          infoWeather, setInfoWeather} = props;

    const { selectedIds, setSelectedIds, taskListToMap, setTaskListToMap} = useContext(TaskContext);

    //CSS
    const classes = useStyles();

    //FUNCTIONS
    const handleToggle = id => () => {     
        var task = noMarkerRows.filter((row, i) => row.t_id === id)[0];
        setActiveMarker(task);
        //setShowingInfoWindow(true);
    };

    const handleRemoveFromSelected = (event, record_id) => {

        //TODO If user changes filter to exclude some already selected items, this breaks.
        const selectedIndex = selectedIds.indexOf(record_id);
        let newSelected = [];
        const row = mapRows.filter((row, index)=> row.t_id == record_id);
        if(row == []){
        error.log("No row found in mapRows");
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

    return(
        <List className={classes.root}>            
            {noMarkerRows.map((row) => {
                const labelId = `checkbox-list-label-${row.t_id}`;
                return (
                    <ListItem key={row.t_id} 
                                role={undefined} dense button 
                                onClick={handleToggle(row.t_id)}
                                onContextMenu={event => handleRightClick(event, row.t_id)}
                                selected={activeMarker && activeMarker.t_id === row.t_id}
                                className={activeMarker ? (activeMarker.t_id === row.t_id ? classes.selectedRow : classes.nonSelectedRow) : classes.nonSelectedRow}>
                      <ListItemText id={labelId}>
                            {row.t_id} | {row.t_name} | {row.priority_order}
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
                  );
            })}
        </List>
        
    );

}
export default MapSiderbarMissingMakers;


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
  }
}));