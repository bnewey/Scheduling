import React, {useRef, useState, useEffect} from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListIcon from '@material-ui/icons/List';
import VisiblityOffIcon from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import { Scrollbars} from 'react-custom-scrollbars';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import MapSidebarMissingMarkers from './MapSidebarMissingMarkers';
import MapSidebarMarkedTasks from './MapSidebarMarkedTasks';
import MapSidebarTaskList from './MapSidebarTaskList';


const useStyles = makeStyles(theme => ({
    root: {
        padding: '1% 2% 2% 2%',
        margin: '0px 0px 0px -90px',
        backgroundColor: '#adb0b0',
        minHeight: '400px',
    },
    head: {
        padding: '1% 2% 1% 2%',
        color: '#fff',
        backgroundColor: '#16233b',
        fontSize: '30px',
        fontWeight: '400',
        display: 'flex',
    },
    body:{
        padding: '1% 1% 1% 1%',
        margin: '0',
        fontWeight: '400',
        fontSize: 'larger',

        maxHeight: '800px',
    },
    details:{
        padding: '2px 8px 8px 6px'
    },
    attention:{
        color: 'red'
    },
    icon:{
        margin: '1px 12px 1px 1px',
        color: '#a0a0a0',
    },
  }));

const MapSidebar = (props) => {
    //STATE
    const [expanded, setExpanded] = React.useState(false);
    //PROPS
    const {mapRows, setMapRows, selectedIds, setSelectedIds, noMarkerRows,markedRows, activeMarker, setActiveMarker, 
            setShowingInfoWindow, setModalOpen, setModalTaskId, taskLists, setTaskLists, setResetBounds} = props;

    useEffect( () =>{ //useEffect for inputText
        if(activeMarker && activeMarker.geocoded)
            setExpanded('panel1');
        return () => { //clean up
            if(activeMarker){
                
            }
        }
    },[activeMarker]);
    
    //CSS
    const classes = useStyles();

    //FUNCTIONS
    const handleChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
     
    return(
        <Paper className={classes.root}>
            <Paper className={classes.head}>
                <MapSidebarTaskList mapRows={mapRows} setMapRows={setMapRows} 
                                    taskLists={taskLists} setTaskLists={setTaskLists}
                                    setActiveMarker={setActiveMarker}
                                    setResetBounds={setResetBounds}
                                    setSelectedIds={setSelectedIds}/>
                
            </Paper>
            <ExpansionPanel expanded={expanded === 'panel1'} onChange={handleChange('panel1')} className={classes.body } >
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                ><ListIcon className={classes.icon}/><span>Mapped Markers:&nbsp;&nbsp;{markedRows.length} Items</span>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                    <Scrollbars universal autoHeight autoHeightMax={400} style={{marginLeft: '20px'}}>
                        <MapSidebarMarkedTasks mapRows={mapRows} setMapRows={setMapRows}
                                                selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                                                activeMarker={activeMarker} setActiveMarker={setActiveMarker}
                                                setShowingInfoWindow={setShowingInfoWindow} 
                                                markedRows={markedRows} 
                                                setModalOpen={setModalOpen} setModalTaskId={setModalTaskId}
                                                setResetBounds={setResetBounds}
                                                />
                    </Scrollbars>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded === 'panel2'} onChange={handleChange('panel2')} className={classes.body} 
                classes={noMarkerRows.length > 0 ? {root: classes.attention} : {}}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                ><VisiblityOffIcon className={classes.icon}/><span>Unmapped Markers:&nbsp;&nbsp;{noMarkerRows.length} Items</span>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details} >
                    <Scrollbars universal autoHeight autoHeightMax={400} style={{marginLeft: '20px'}}>
                        <MapSidebarMissingMarkers mapRows={mapRows} setMapRows={setMapRows}
                                                selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                                                noMarkerRows={noMarkerRows} 
                                                setModalOpen={setModalOpen} setModalTaskId={setModalTaskId} setResetBounds={setResetBounds}/>
                    </Scrollbars>
                </ExpansionPanelDetails>
            </ExpansionPanel>

        </Paper>
    );

} 

export default MapSidebar;