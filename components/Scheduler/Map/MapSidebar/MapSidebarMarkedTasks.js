import React, {useRef, useState, useEffect} from 'react';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import Tasks from '../../../../js/Tasks';

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

const MapSiderbarMarkedTasks = (props) =>{


    //STATE

    //PROPS
    //activeMarkerId / setActiveMarkerId / markedRows passed from MapContainer => MapSidebar => Here
    const {activeMarker, setActiveMarker, setShowingInfoWindow, markedRows } = props;
    
    //CSS
    const classes = useStyles();
    //FUNCTIONS
    const handleToggle = id => () => {     
        var task = markedRows.filter((row, i) => row.t_id === id)[0];
        setActiveMarker(task);
        setShowingInfoWindow(true);
    };

    //move this functionality to tasks instead of marker sidebar / replace with remove from selected
    const handleDelete = id => () => {
        Tasks.removeTask(id)
        .then(alert(id + ': deleted'))
        .catch( error => {
          console.warn(JSON.stringify(error, null,2));
        });
    };
    


    return(
        <List className={classes.root}>            
            {markedRows.map((row) => {
                const labelId = `checkbox-list-label-${row.t_id}`;
                return (
                    <ListItem key={row.t_id} 
                                role={undefined} dense button 
                                onClick={handleToggle(row.t_id)}
                                selected={activeMarker && activeMarker.t_id === row.t_id}
                                className={activeMarker ? (activeMarker.t_id === row.t_id ? classes.selectedRow : classes.nonSelectedRow) : classes.nonSelectedRow}>
                      <ListItemText id={labelId}>
                            {row.t_id} | {row.t_name} | {row.priority_order}
                      </ListItemText>
                      <ListItemSecondaryAction>
                        { activeMarker && activeMarker.t_id === row.t_id ? 
                            <IconButton edge="end" aria-label="comments" onClick={handleDelete(activeMarker.t_id)}>
                               <DeleteIcon />
                            </IconButton> : <div></div>}
                        &nbsp;&nbsp;&nbsp;
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
            })}
        </List>
    );

}
export default MapSiderbarMarkedTasks;