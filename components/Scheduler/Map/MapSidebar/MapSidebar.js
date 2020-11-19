import React, {useRef, useState, useEffect, useContext} from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListIcon from '@material-ui/icons/List';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';
import CloudIcon from '@material-ui/icons/Cloud';
import SortFlipIcon from '@material-ui/icons/ImportExport';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityOnIcon from '@material-ui/icons/Visibility';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import { Scrollbars} from 'react-custom-scrollbars';
import {makeStyles, Paper, Accordion, AccordionDetails, AccordionSummary, Select,MenuItem, IconButton} from '@material-ui/core'

import MapSidebarMissingMarkers from './MapSidebarMissingMarkers';
import MapSidebarMarkedTasks from './MapSidebarMarkedTasks';
import MapSidebarCrewJobs from './MapSidebarCrewJobs';
import MapSidebarVehicleRows from './MapSidebarVehicleRows';
import MapSidebarToolbar from './MapSidebarToolbar';
import MapSidebarRadarControls from './MapSidebarRadarControls';

import { CrewContext } from '../../Crew/CrewContextContainer';

import { withRouter } from "next/router";
import Link from "next/link";

const sorter_table = [{text: "Order", field: "priority_order",  type: 'number'},
                    {text: "1st Game", field: "first_game", type: 'date'},
                    {text: "Name", field: "t_name", type: 'text'},
                    {text: "State", field: "state", type: 'text'},
                    {text: "Type", field: "type", type: 'text'},
                    {text: "d_date", field: "drill_date", type: 'date'},
                    {text: "i_date", field: "sch_install_date", type: 'date'}]

const MapSidebar = (props) => {
    //STATE
    const [expanded, setExpanded] = React.useState(false);
    const [expandedAnimDone,setExpandedAnimDone] = React.useState(false);

    const [sorterVariable, setSorterVariable] = React.useState( "priority_order");
    const [sorterState, setSorterState] = useState(0);

    const panelRef = useRef(null);
    const vehiclePanelRef = useRef(null);
    const crewPanelRef = useRef(null);

    const { crewMembers,setCrewMembers, allCrewJobs, allCrews, setAllCrews,
        setAllCrewJobs, allCrewJobMembers, setAllCrewJobMembers, setShouldResetCrewState,
         } = useContext(CrewContext);


    //PROPS
    const {mapRows, setMapRows, noMarkerRows,markedRows, activeMarker, setActiveMarker, 
            setShowingInfoWindow, setModalOpen, setModalTaskId, setResetBounds,  
            bouncieAuthNeeded, setBouncieAuthNeeded, vehicleRows, setVehicleRows, visibleItems, setVisibleItems,
            visualTimestamp, setVisualTimestamp,
            radarControl, setRadarControl, radarOpacity, setRadarOpacity,
            radarSpeed, setRadarSpeed, timestamps, setTimestamps,
            multipleMarkersOneLocation,setMultipleMarkersOneLocation, sorters, setSorters, crewJobs, setCrewJobs, crewToMap, setCrewToMap} = props;

    //Ref to check if same vehicle is active so we dont keep expanding vehicle panel on vehicle refetch
    const activeVehicleRef = useRef(null);

    useEffect( () =>{ //useEffect for inputText
        if( activeMarker?.type === "task" && activeMarker?.item?.geocoded && expanded!="taskMarker" ){
            setExpanded('taskMarker');
            setExpandedAnimDone(false);
        }

        if ( activeMarker?.type === "vehicle" && expanded != "vehicleMarker" && ( activeMarker.item.vin !=  activeVehicleRef.current)){
            setExpanded('vehicleMarker' )
            setExpandedAnimDone(false);    
        }

        if( activeMarker?.type === "crew" && expanded != "crewJobMarker"){
            setExpanded('crewJobMarker');
            setExpandedAnimDone(false);
        }

        if(activeMarker?.type === "vehicle"){
            activeVehicleRef.current = activeMarker.item?.vin;
        }

        //Need to null multiple marker variable on new activeMarker
        if(multipleMarkersOneLocation && activeMarker?.type ==="task" && multipleMarkersOneLocation.indexOf(activeMarker.item.t_id.toString())== -1 ){
            setMultipleMarkersOneLocation(null);
        }
        return () => { //clean up
            if(activeMarker){

            }
        }
    },[activeMarker]);

    //Sort
    useEffect(()=>{
        if(sorterVariable && sorterVariable != ""){
            var item = sorter_table.filter((v,i)=> sorterVariable == v.field)[0];
            //sort taskListItems according to item
            //this sort can take multiple sorters but i dont think its necessary
            // if it is, you will have to change the [0] to a dynamic index!
            if(item.type == 'date' || item.type == 'number' || item.type == 'text'){
                setSorters([{
                    property: item.field, 
                    direction: sorters && sorters[0] && sorters[0].property == item.field ? 
                            ( sorterState === 0 ? "ASC" : sorterState === 1 ? "DESC" : "ASC" ) : "ASC"
                }]);
                
            }
        }
    }, [sorterVariable, sorterState])

    //Set crewjobs as visible on crewToMap Change
    useEffect(()=>{
        if(crewToMap){
            if(visibleItems.indexOf("crewJobs") == -1){
                toggleVisible(null, 'crewJobs')
            }
        }
    },[crewToMap])
    
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

    const toggleVisible = (event, newVisible) => {
        
        //newVisible not currently in, so add
        if(visibleItems.indexOf(newVisible) == -1){
            var updateVisible = [...visibleItems, newVisible]

            if(newVisible === "tasks"){
                if(visibleItems.indexOf("crewJobs") != -1){
                    updateVisible = [...updateVisible.filter((item,i)=> item != "crewJobs")]
                }
            }
            if(newVisible === "crewJobs"){
                if(visibleItems.indexOf("tasks") != -1){
                    updateVisible = [...updateVisible.filter((item,i)=> item != "tasks")]
                }
            }

            setVisibleItems(updateVisible);
        }else{
            //newVisible is already in, so remove
            setVisibleItems([...visibleItems.filter((item,i)=> item != newVisible)]);
        }   

        if(event){
            event.stopPropagation();
        }
        
    };

    const isVisible = (item) =>{
        return(visibleItems.indexOf(item) != -1);
    }

    const handleChangeSorter = (event) =>{
        if(event.target.value){
            setSorterVariable(event.target.value);
            setSorterState(0);
            console.log("Sorter changed", event.target.value)
        }

        event.stopPropagation();
    }

    const handleFlipSort= (event)=>{
        setSorterState( sorterState == 0 ? 1 : 0);
        event.stopPropagation();
    }

    const handleChangeCrewToMap = (event)=>{
        if(event.target.value === ""){
            setCrewJobs(null);
            setCrewToMap(null);
            if(activeMarker?.type === "crew"){
                setActiveMarker(null);
            }
        }
        if(event.target.value){
            console.log("event.target.value", event.target.value)
            var crew = allCrews.find((item)=> item.id == event.target.value);
            setCrewToMap(crew);
            setCrewJobs(null);
        }
        event.stopPropagation();
    }
     
    return(
        <Paper className={classes.root}>
            <Paper className={classes.head}>
                <MapSidebarToolbar {...props} />
                
            </Paper>
            <Accordion expanded={expanded === 'taskMarker'} onChange={handleChange('taskMarker')} className={classes.body } 
                TransitionProps={{onEntered: event=> handleAnimationEnd(event)}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="taskMarkerbh-content"
                    id="taskMarkerbh-header"
                    classes={{content: classes.expPanelSummary}}
                >
                    <ListIcon className={classes.icon}/><span>Tasks:&nbsp;&nbsp;{markedRows?.length} Items</span>
                    <div className={classes.sortByDiv}>Sort By:&nbsp;
                        <Select
                            value={sorterVariable}
                            onChange={handleChangeSorter}
                            displayEmpty
                            className={classes.selectSorter}
                            inputProps={{ 'aria-label': 'Without label' }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {sorter_table.map((item, i)=> (
                                <MenuItem value={item.field}>{item.text}</MenuItem>
                            ))}
                        </Select>
                        <IconButton className={classes.sortIcon} onClick={handleFlipSort}>
                            <SortFlipIcon/>
                        </IconButton>
                    </div>
                    {isVisible('tasks') ? <VisibilityOnIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'tasks')} style={{ color: 'rgb(25, 109, 234)' }}/>
                            : <VisibilityOffIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'tasks')}/>}
                </AccordionSummary>
                <AccordionDetails ref={panelRef} className={classes.details}>
                    <Scrollbars universal autoHeight autoHeightMax={400}>
                        <MapSidebarMarkedTasks {...props} panelRef={panelRef} expanded={expanded} 
                                        expandedAnimDone={expandedAnimDone}
                                                />
                    </Scrollbars>
                </AccordionDetails>
            </Accordion>

            <Accordion expanded={expanded === 'crewJobMarker'} onChange={handleChange('crewJobMarker')} className={classes.body } 
                TransitionProps={{onEntered: event=> handleAnimationEnd(event)}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="crewJobMarkerbh-content"
                    id="crewJobMarkerbh-header"
                    classes={{content: classes.expPanelSummary}}
                >
                    <ListIcon className={classes.icon}/><span>Crew Jobs:&nbsp;&nbsp;{crewJobs?.length} Items</span>
                    <div className={classes.sortByDiv}>Select Crew:&nbsp;
                        <Select
                            value={crewToMap?.id}
                            onChange={handleChangeCrewToMap}
                            displayEmpty
                            className={classes.selectSorter}
                            inputProps={{ 'aria-label': 'Without label' }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {allCrews && allCrews.map((item, i)=> (
                                <MenuItem value={item.id}>{item.crew_leader_name}</MenuItem>
                            ))}
                        </Select>
                    </div>
                    {isVisible('crewJobs') ? <VisibilityOnIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'crewJobs')} style={{ color: 'rgb(25, 109, 234)' }}/>
                            : <VisibilityOffIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'crewJobs')}/>}
                </AccordionSummary>
                <AccordionDetails ref={crewPanelRef} className={classes.details}>
                    <Scrollbars universal autoHeight autoHeightMax={400}>
                        {<MapSidebarCrewJobs {...props} panelRef={crewPanelRef} expanded={expanded} 
                                        expandedAnimDone={expandedAnimDone}
                                                /> }
                    </Scrollbars>
                </AccordionDetails>
            </Accordion>
            
            <Accordion expanded={expanded === 'vehicleMarker'} onChange={handleChange('vehicleMarker')} className={classes.body }
                TransitionProps={{onEntered: event=> handleAnimationEnd(event)}} >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="vehicleMarkerbh-content"
                    id="vehicleMarkerbh-header"
                    classes={{content: classes.expPanelSummary}}
                ><DirectionsCarIcon className={classes.icon}/><span>Vehicles:&nbsp;&nbsp;{bouncieAuthNeeded ? "Authentication needed" : (vehicleRows ? vehicleRows.length : "") }</span>
                {isVisible('vehicles') ? <VisibilityOnIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'vehicles')} style={{ color: 'rgb(25, 109, 234)' }}/>
                            : <VisibilityOffIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'vehicles')}/>}
                </AccordionSummary>
                <AccordionDetails  ref={vehiclePanelRef} className={classes.details}>
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
                </AccordionDetails>
            </Accordion>
            
            <Accordion expanded={expanded === 'radarExp'} onChange={handleChange('radarExp')} className={classes.body } 
                TransitionProps={{onEntered: event=> handleAnimationEnd(event)}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="radarExpbh-content"
                    id="radarExpbh-header"
                    classes={{content: classes.expPanelSummary}}
                ><CloudIcon className={classes.icon}/><span>Radar Controls</span>
                {isVisible('radar') ? <PowerSettingsNewIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'radar')} style={{ color: 'rgb(25, 109, 234)' }}/>
                            : <PowerSettingsNewIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'radar')}/>}
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                    
                        { isVisible('radar') &&
                        <>
                        
                        < MapSidebarRadarControls visibleItems={visibleItems} setVisibleItems={setVisibleItems}  visualTimestamp={visualTimestamp}
                             setVisualTimestamp={setVisualTimestamp} radarControl={radarControl} setRadarControl={setRadarControl}
                              radarOpacity={radarOpacity} setRadarOpacity={setRadarOpacity} radarSpeed={radarSpeed} setRadarSpeed={setRadarSpeed}
                              timestamps={timestamps} setTimestamps={setTimestamps}/>
                        </>
                        }
                </AccordionDetails>
            </Accordion>
            

            { noMarkerRows && noMarkerRows.length >0  ? 
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} className={classes.body} 
                classes={noMarkerRows && noMarkerRows.length > 0 ? {root: classes.attention} : {}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="taskMarkerbh-content"
                    id="taskMarkerbh-header"
                    classes={{content: classes.expPanelSummary}}
                ><VisibilityOffIcon className={classes.icon}/><span>Unmapped Markers:&nbsp;&nbsp;{noMarkerRows?.length} Items</span>
                </AccordionSummary>
                <AccordionDetails className={classes.details} >
                    <Scrollbars universal autoHeight autoHeightMax={400} style={{marginLeft: '20px'}}>
                        <MapSidebarMissingMarkers {...props}/>
                    </Scrollbars>
                </AccordionDetails>
            </Accordion>
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
    sortIcon:{
        padding: '5px 5px',
    },
    sortByDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
  }));