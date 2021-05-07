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
import {makeStyles, Paper, Accordion, AccordionDetails, AccordionSummary, Select,MenuItem, IconButton, Switch, Tabs, Tab, Box} from '@material-ui/core'


import MapSidebarMissingMarkers from './MapSidebarMissingMarkers';

import MapSidebarCrewJobs from './MapSidebarCrewJobs';
import MapSidebarVehicleRows from './MapSidebarVehicleRows';
import MapSidebarRadarControls from './MapSidebarRadarControls';


import { CrewContext } from '../../Crew/CrewContextContainer';

import { withRouter } from "next/router";
import Link from "next/link";
import { MapContext } from '../MapContainer';
import { TaskContext } from '../../TaskContainer';

const sorter_table = [{text: "Order", field: "priority_order",  type: 'number'},
                    {text: "1st Game", field: "first_game", type: 'date'},
                    {text: "Name", field: "t_name", type: 'text'},
                    {text: "State", field: "state", type: 'text'},
                    {text: "Type", field: "type", type: 'text'},
                    {text: "d_date", field: "drill_date", type: 'date'},
                    {text: "i_date", field: "sch_install_date", type: 'date'}];

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

function TabPanel(props) {
    const { children, value, index, ref, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <div>
            {children}
          </div>
        )}
      </div>
    );
}

const MapSidebar = (props) => {
    //STATE
    const [expanded, setExpanded] = React.useState(false);
    const [expandedAnimDone,setExpandedAnimDone] = React.useState(false);

    const [tabValue, setTabValue] = React.useState(0);

    const [sorterVariable, setSorterVariable] = React.useState( "priority_order");
    const [sorterState, setSorterState] = useState(0);

    const panelRef = useRef(null);
    const vehiclePanelRef = useRef(null);
    const crewPanelRef = useRef(null);
    

    const { crewMembers,setCrewMembers, allCrewJobs, allCrews, setAllCrews,
        setAllCrewJobs, allCrewJobMembers, setAllCrewJobMembers, setShouldResetCrewState, crewJobDateRange, setCrewJobDateRange,
        crewJobDateRangeActive, setCrewJobDateRangeActive} = useContext(CrewContext);

    const { mapRows, setMapRows,noMarkerRows, setMapRowsRefetch, markedRows, setMarkedRows, vehicleRows, setVehicleRows,
        activeMarker, setActiveMarker,  setResetBounds, infoWeather,setInfoWeather, bouncieAuthNeeded,setBouncieAuthNeeded, visibleItems, setVisibleItems,
        visualTimestamp, setVisualTimestamp, radarControl, setRadarControl,  radarOpacity, setRadarOpacity, radarSpeed, setRadarSpeed, timestamps, setTimestamps,
        multipleMarkersOneLocation, setMultipleMarkersOneLocation, crewJobs, setCrewJobs, crewJobsRefetch, setCrewJobsRefetch, unfilteredJobs, setUnfilteredJobs,
        showCompletedJobs, setShowCompletedJobs,setShowingInfoWindow} = useContext(MapContext);

    const { setModalOpen, setModalTaskId,  crewToMap, setCrewToMap, sorters, setSorters, setInstallDateFilters} = useContext(TaskContext);
    //const {   } = props;

    //Ref to check if same vehicle is active so we dont keep expanding vehicle panel on vehicle refetch
    const activeVehicleRef = useRef(null);

    useEffect( () =>{ //useEffect for inputText

        if ( activeMarker?.type === "vehicle" && tabValue != 1 && ( activeMarker.item.vin !=  activeVehicleRef.current)){
            setTabValue(1);
            setExpandedAnimDone(false);    
        }

        if( activeMarker?.type === "crew" && tabValue != 0){
            setTabValue(0);
            setExpandedAnimDone(false);
        }

        if(activeMarker?.type === "vehicle"){
            activeVehicleRef.current = activeMarker.item?.vin;
        }

        //Need to null multiple marker variable on new activeMarker
        console.log('activeMarker', activeMarker);
        console.log("multipleMarkersOneLocation",multipleMarkersOneLocation)
        console.log("multipleMarkersOneLocation.indexOf(activeMarker?.item?.id.toString())",multipleMarkersOneLocation?.indexOf(activeMarker?.item?.id))
        if(multipleMarkersOneLocation && activeMarker?.type ==="crew" && multipleMarkersOneLocation.indexOf(activeMarker?.item?.id)== -1 ){
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
    // const handleChange = panel => (event, isExpanded) => {
    //     setExpanded(isExpanded ? panel : false);
    // };
    const handleChangeTab = (event, newTabValue) =>{
        setTabValue(newTabValue);
        
    }

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
            setCrewJobsRefetch(true);
            setCrewToMap(null);
            if(activeMarker?.type === "crew"){
                setActiveMarker(null);
            }
        }
        if(event.target.value){
            console.log("event.target.value", event.target.value)
            var crew = allCrews.find((item)=> item.id == event.target.value);
            setCrewToMap(crew);
            setCrewJobsRefetch(true)
        }
        event.stopPropagation();
    }

     
    return(
        <div className={classes.root}>
         
            <Tabs
            value={tabValue}
            onChange={handleChangeTab}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="sidebar tabs"
            >
                {/* <Tab label="Tasks" {...a11yProps(0)} /> */}
                <Tab label={<div className={classes.tabDiv}>Crew Jobs {isVisible('crewJobs') ? <VisibilityOnIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'crewJobs')} style={{ color: 'rgb(25, 109, 234)' }}/>
                                : <VisibilityOffIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'crewJobs')}/>} </div>}
                    {...a11yProps(1)} >
                    
                </Tab>
                <Tab label={<div className={classes.tabDiv}>Vehicles {isVisible('vehicles') ? <VisibilityOnIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'vehicles')} style={{ color: 'rgb(25, 109, 234)' }}/>
                                : <VisibilityOffIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'vehicles')}/>} </div>} 
                    {...a11yProps(2)} />
                <Tab label={<div className={classes.tabDiv}>Weather {isVisible('radar') ? <PowerSettingsNewIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'radar')} style={{ color: 'rgb(25, 109, 234)' }}/>
                                : <PowerSettingsNewIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'radar')}/>} </div>} 
                    {...a11yProps(3)} />
                { noMarkerRows && noMarkerRows.length >0  ? 
                <Tab label="No Marker" {...a11yProps(4)}/>
                : ''}
            </Tabs>
     
        
        {/* <TabPanel value={tabValue} index={0} >
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
                <Scrollbars  ref={s => { panelRef.current = (s?.view); }}  universal autoHeight autoHeightMax={600}>
                    <MapSidebarMarkedTasks {...props} panelRef={panelRef} tabValue={tabValue} 
                                    expandedAnimDone={expandedAnimDone} setExpandedAnimDone={setExpandedAnimDone}
                                            />
                </Scrollbars>
        </TabPanel> */}
        <TabPanel value={tabValue} index={0}>
               

                <MapSidebarCrewJobs  panelRef={crewPanelRef} tabValue={tabValue} setTabValue={setTabValue} expandedAnimDone={expandedAnimDone} /> 

        </TabPanel>
        <TabPanel value={tabValue} index={1}>
                <Scrollbars universal autoHeight autoHeightMax={400}>
                         <><MapSidebarVehicleRows vehiclePanelRef={vehiclePanelRef} tabValue={tabValue} setTabValue={setTabValue}
                                expanded={expanded} setExpanded={setExpanded} expandedAnimDone={expandedAnimDone} />
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
                       
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
                { isVisible('radar') &&
                    <>
                        <MapSidebarRadarControls visibleItems={visibleItems} setVisibleItems={setVisibleItems}  visualTimestamp={visualTimestamp}
                            setVisualTimestamp={setVisualTimestamp} radarControl={radarControl} setRadarControl={setRadarControl}
                            radarOpacity={radarOpacity} setRadarOpacity={setRadarOpacity} radarSpeed={radarSpeed} setRadarSpeed={setRadarSpeed}
                            timestamps={timestamps} setTimestamps={setTimestamps}/>
                    </>
                }
        </TabPanel>
        { noMarkerRows && noMarkerRows.length >0  ? 
            <TabPanel value={tabValue} index={3}>
                    <Scrollbars universal autoHeight autoHeightMax={600} style={{marginLeft: '20px'}}>
                        <MapSidebarMissingMarkers {...props}/>
                    </Scrollbars>
            </TabPanel> 
            :<></>}
       
            {/* <Accordion expanded={expanded === 'taskMarker'} onChange={handleChange('taskMarker')} className={classes.body } 
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
                                <MenuItem value={item.id}>{item.crew_leader_name ? item.crew_leader_name : `Crew ${item.id}`}</MenuItem>
                            ))}
                        </Select>
                    </div>
                    {isVisible('crewJobs') ? <VisibilityOnIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'crewJobs')} style={{ color: 'rgb(25, 109, 234)' }}/>
                            : <VisibilityOffIcon className={classes.iconClickable} onClick={event=> toggleVisible(event, 'crewJobs')}/>}
                    
                </AccordionSummary>
                <AccordionDetails ref={crewPanelRef} className={classes.details}>
                    <Scrollbars universal autoHeight autoHeightMax={400}>
                        {<MapSidebarCrewJobs {...props} panelRef={crewPanelRef} expanded={expanded} 
                                        expandedAnimDone={expandedAnimDone} showCompletedJobs={showCompletedJobs} setShowCompletedJobs={setShowCompletedJobs}
                                        crewJobDateRange={crewJobDateRange} setCrewJobDateRange={setCrewJobDateRange}
                                        allCrews={allCrews} setAllCrews={setAllCrews} crewJobs={crewJobs} setCrewJobs={setCrewJobs} 
                                        crewJobsRefetch={crewJobsRefetch} setCrewJobsRefetch={setCrewJobsRefetch}
                                        unfilteredJobs={unfilteredJobs} setUnfilteredJobs={setUnfilteredJobs}
                                        setShouldResetCrewState={setShouldResetCrewState} /> }
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
            :<></>}*/}

        </div>
    );

} 

export default MapSidebar;

const useStyles = makeStyles(theme => ({
    root: {
        padding: '1% 2% 2% 2%',
        margin: '0px 0px 0px 0px',
        //minHeight: '400px',
        height: '100%',
        [theme.breakpoints.up('md')]:{
            minHeight: '647px',
        },
    },
    tabDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    iconChecked:{
        width: '1em',
        height: '1em',
        color:'#33bb22',
    },
    icon:{
        width: '1em',
        height: '1em',
        color:'#929292',
        '&:hover':{
            color: '#303030',
        },
        backgroundColor: 'linear-gradient(0deg, #f5f5f5, white)'
    },
  }));
