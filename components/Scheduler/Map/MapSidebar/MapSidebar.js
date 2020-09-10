import React, {useRef, useState, useEffect} from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListIcon from '@material-ui/icons/List';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';
import CloudIcon from '@material-ui/icons/Cloud';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityOnIcon from '@material-ui/icons/Visibility';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import { Scrollbars} from 'react-custom-scrollbars';
import {makeStyles, Paper, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary} from '@material-ui/core'

import MapSidebarMissingMarkers from './MapSidebarMissingMarkers';
import MapSidebarMarkedTasks from './MapSidebarMarkedTasks';
import MapSidebarVehicleRows from './MapSidebarVehicleRows';
import MapSidebarToolbar from './MapSidebarToolbar';
import MapSidebarRadarControls from './MapSidebarRadarControls';

import { withRouter } from "next/router";
import Link from "next/link";

const MapSidebar = (props) => {
    //STATE
    const [expanded, setExpanded] = React.useState(false);
    const [expandedAnimDone,setExpandedAnimDone] = React.useState(false);

    const panelRef = useRef(null);
    const vehiclePanelRef = useRef(null);

    //PROPS
    const {mapRows, setMapRows, noMarkerRows,markedRows, activeMarker, setActiveMarker, 
            setShowingInfoWindow, setModalOpen, setModalTaskId, setResetBounds, activeVehicle, setActiveVehicle, 
            bouncieAuthNeeded, setBouncieAuthNeeded, vehicleRows, setVehicleRows, visibleItems, setVisibleItems,
            visualTimestamp, setVisualTimestamp,
            radarControl, setRadarControl, radarOpacity, setRadarOpacity,
            radarSpeed, setRadarSpeed, timestamps, setTimestamps,
            multipleMarkersOneLocation,setMultipleMarkersOneLocation} = props;

    //Ref to check if same vehicle is active so we dont keep expanding vehicle panel on vehicle refetch
    const activeVehicleRef = useRef(null);

    useEffect( () =>{ //useEffect for inputText
        if(activeMarker && activeMarker.geocoded && expanded!="taskMarker" ){
            setExpanded('taskMarker');
            setExpandedAnimDone(false);
        }

        if(activeVehicle && expanded != "vehicleMarker" && ( activeVehicle.vin !=  activeVehicleRef.current)){
            setExpanded('vehicleMarker' )
            setExpandedAnimDone(false);    
        }

        if(activeVehicle){
            activeVehicleRef.current = activeVehicle.vin;
        }

        //Need to null multiple marker variable on new activeMarker
        if(multipleMarkersOneLocation && activeMarker && multipleMarkersOneLocation.indexOf(activeMarker.t_id.toString())== -1 ){
            setMultipleMarkersOneLocation(null);
        }
        return () => { //clean up
            if(activeMarker){

            }
        }
    },[activeMarker, activeVehicle]);
    
    //CSS
    const classes = useStyles();

    //FUNCTIONS
    const handleChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleResetAfterAuth = (event)=>{
        //setVehicleRows(null);
        //setBouncieAuthNeeded(false);
    }

    const handleAnimationEnd = (event) => {
        setExpandedAnimDone(true);
    }

    const handleVisible = (event, newVisible) => {
        if(visibleItems.indexOf(newVisible) == -1){
            setVisibleItems([...visibleItems, newVisible]);
        }else{
            setVisibleItems([...visibleItems.filter((item,i)=> item != newVisible)]);
        }   
        event.stopPropagation();
    };

    const isVisible = (item) =>{
        return(visibleItems.indexOf(item) != -1);
    }

    
     
    return(
        <Paper className={classes.root}>
            <Paper className={classes.head}>
                <MapSidebarToolbar {...props} />
                
            </Paper>
            <ExpansionPanel expanded={expanded === 'taskMarker'} onChange={handleChange('taskMarker')} className={classes.body } 
                TransitionProps={{onEntered: event=> handleAnimationEnd(event)}}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="taskMarkerbh-content"
                    id="taskMarkerbh-header"
                    classes={{content: classes.expPanelSummary}}
                ><ListIcon className={classes.icon}/><span>Tasks:&nbsp;&nbsp;{markedRows.length} Items</span>
                {isVisible('tasks') ? <VisibilityOnIcon className={classes.iconClickable} onClick={event=> handleVisible(event, 'tasks')} style={{ color: 'rgb(25, 109, 234)' }}/>
                            : <VisibilityOffIcon className={classes.iconClickable} onClick={event=> handleVisible(event, 'tasks')}/>}
                </ExpansionPanelSummary>
                <ExpansionPanelDetails ref={panelRef} className={classes.details}>
                    <Scrollbars universal autoHeight autoHeightMax={400}>
                        <MapSidebarMarkedTasks {...props} panelRef={panelRef} expanded={expanded} 
                                        expandedAnimDone={expandedAnimDone}
                                                />
                    </Scrollbars>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            
            <ExpansionPanel expanded={expanded === 'vehicleMarker'} onChange={handleChange('vehicleMarker')} className={classes.body }
                TransitionProps={{onEntered: event=> handleAnimationEnd(event)}} >
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="vehicleMarkerbh-content"
                    id="vehicleMarkerbh-header"
                    classes={{content: classes.expPanelSummary}}
                ><DirectionsCarIcon className={classes.icon}/><span>Vehicles:&nbsp;&nbsp;{bouncieAuthNeeded ? "Authentication needed" : (vehicleRows ? vehicleRows.length : "") }</span>
                {isVisible('vehicles') ? <VisibilityOnIcon className={classes.iconClickable} onClick={event=> handleVisible(event, 'vehicles')} style={{ color: 'rgb(25, 109, 234)' }}/>
                            : <VisibilityOffIcon className={classes.iconClickable} onClick={event=> handleVisible(event, 'vehicles')}/>}
                </ExpansionPanelSummary>
                <ExpansionPanelDetails  ref={vehiclePanelRef} className={classes.details}>
                    <>
                    <Scrollbars universal autoHeight autoHeightMax={400}>
                         <><MapSidebarVehicleRows {...props} vehiclePanelRef={vehiclePanelRef} expanded={expanded} setExpanded={setExpanded}
                                        expandedAnimDone={expandedAnimDone}
                                                />
                        </> 
                    </Scrollbars>
                    {bouncieAuthNeeded==true ? 
                            <>
                            <div className={classes.authDiv}>
                            <Link href={`/bouncieAuth`} as={`/bouncieAuth`} onClick={event => handleResetAfterAuth(event)}>
                                <span>Authenticate Bouncie gain access to vehicle information</span>
                            </Link>
                            </div>
                            </> : <></>}
                            </>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            
            <ExpansionPanel expanded={expanded === 'radarExp'} onChange={handleChange('radarExp')} className={classes.body } 
                TransitionProps={{onEntered: event=> handleAnimationEnd(event)}}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="radarExpbh-content"
                    id="radarExpbh-header"
                    classes={{content: classes.expPanelSummary}}
                ><CloudIcon className={classes.icon}/><span>Radar Controls</span>
                {isVisible('radar') ? <PowerSettingsNewIcon className={classes.iconClickable} onClick={event=> handleVisible(event, 'radar')} style={{ color: 'rgb(25, 109, 234)' }}/>
                            : <PowerSettingsNewIcon className={classes.iconClickable} onClick={event=> handleVisible(event, 'radar')}/>}
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                    
                        { isVisible('radar') &&
                        <>
                        
                        < MapSidebarRadarControls visibleItems={visibleItems} setVisibleItems={setVisibleItems}  visualTimestamp={visualTimestamp}
                             setVisualTimestamp={setVisualTimestamp} radarControl={radarControl} setRadarControl={setRadarControl}
                              radarOpacity={radarOpacity} setRadarOpacity={setRadarOpacity} radarSpeed={radarSpeed} setRadarSpeed={setRadarSpeed}
                              timestamps={timestamps} setTimestamps={setTimestamps}/>
                        </>
                        }
                </ExpansionPanelDetails>
            </ExpansionPanel>
            

            { noMarkerRows && noMarkerRows.length >0  ? 
            <ExpansionPanel expanded={expanded === 'panel2'} onChange={handleChange('panel2')} className={classes.body} 
                classes={noMarkerRows && noMarkerRows.length > 0 ? {root: classes.attention} : {}}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="taskMarkerbh-content"
                    id="taskMarkerbh-header"
                    classes={{content: classes.expPanelSummary}}
                ><VisibilityOffIcon className={classes.icon}/><span>Unmapped Markers:&nbsp;&nbsp;{noMarkerRows.length} Items</span>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details} >
                    <Scrollbars universal autoHeight autoHeightMax={400} style={{marginLeft: '20px'}}>
                        <MapSidebarMissingMarkers {...props}/>
                    </Scrollbars>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            :<></>}

        </Paper>
    );

} 

export default MapSidebar;

const useStyles = makeStyles(theme => ({
    root: {
        padding: '1% 2% 2% 2%',
        margin: '0px 0px 0px 0px',
        background: 'linear-gradient( #dadada, #a2a2a2)',
        boxShadow: '0px 1px 8px 0px rgba(0,0,0,0.52)',
        //minHeight: '400px',
        height: '100%',
        [theme.breakpoints.up('md')]:{
            minHeight: '647px',
        },
        
    },
    head: {
        padding: '1% 2% 1% 2%',
        color: '#fff',
        backgroundColor: '#16233b',
        fontSize: '16px',
        fontWeight: '400',
        display: 'block',
    },
    body:{
        padding: '0% 1% 0% 1%',
        margin: '0',
        fontWeight: '400',
        fontSize: 'larger',

        maxHeight: '800px',
    },
    details:{
        padding: '2px 8px 8px 6px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ebfffb',
        marginBottom: '4px',
    },
    attention:{
        color: 'red'
    },
    icon:{
        margin: '1px 12px 1px 1px',
        color: '#a0a0a0',
    },
    iconClickable:{
        margin: '1px 12px 1px 1px',
        color: '#a0a0a0',
        '&:hover':{
            color: '#3c3c3c !important',
            cursor: 'pointer',
            
        }
    },
    authDiv:{
        backgroundColor: '#f1bebeb0',
        fontSize: '1em',
        padding: '2px',
        textAlign: 'center',
        color: '#25272b',
        cursor: 'pointer',
    },
    expPanelSummary:{
        justifyContent: 'space-between'
    },
  }));