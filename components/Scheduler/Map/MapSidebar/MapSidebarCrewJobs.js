import React, {useRef, useState, useEffect, useContext, useLayoutEffect} from 'react';


import {makeStyles, List as MUIList, ListItem, ListItemSecondaryAction, ListItemText,IconButton, Switch, 
        Paper, Grid,  ListSubheader,  Popover, Checkbox, Button,
        Collapse, Accordion, AccordionDetails, AccordionSummary, Tooltip} from '@material-ui/core';

import { List } from 'react-virtualized';
import ReactDOM from 'react-dom';

import DeleteIcon from '@material-ui/icons/Clear';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import EditIcon from '@material-ui/icons/Edit';
import cogoToast from 'cogo-toast';

import clsx from 'clsx';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Tasks from '../../../../js/Tasks';
import Crew from '../../../../js/Crew';
import TaskLists from '../../../../js/TaskLists';
import TLCrewJobDatePicker from '../../TaskList/components/TLCrewJobDatePicker';
import {TaskContext} from '../../TaskContainer';
import Util from '../../../../js/Util';

import {createSorter} from '../../../../js/Sort';

import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import MapSidebarCrewJobsServiceCounter from './components/MapSidebarCrewJobsServiceCounter';
import MapSidebarCrewJobsTypePopover from './components/MapSidebarCrewJobsTypePopover';
import MapSidebarCrewFilter from './components/MapSidebarCrewFilter';


import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SwapIcon from '@material-ui/icons/SwapHoriz';
// import { confirmAlert } from 'react-confirm-alert'; // Import
// import ConfirmYesNo from '../../../../UI/ConfirmYesNo';

//import { CrewContext } from '../../CrewContextContainer';

import moment from 'moment'

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';
import { MapContext } from '../MapContainer';
import { CrewContext } from '../../Crew/CrewContextContainer';



const MapSiderbarCrewJobs = (props) =>{


  //STATE

  //PROPS
  //activeMarkerId / setActiveMarkerId / markedRows passed from MapContainer => MapSidebar => Here
  const {   panelRef, tabValue, setTabValue, expandedAnimDone } = props;

  const { crewMembers,setCrewMembers, allCrewJobs, allCrews, setAllCrews,  setAllCrewJobs, allCrewJobMembers, setAllCrewJobMembers, setShouldResetCrewState, crewJobDateRange, setCrewJobDateRange,
    crewJobDateRangeActive, setCrewJobDateRangeActive
        } = useContext(CrewContext);

  const { selectedIds, setSelectedIds, taskListToMap, setTaskListToMap, taskListTasksSaved,crewToMap, setCrewToMap,
     setModalOpen, setModalTaskId,   sorters, setSorters,job_types, user} = useContext(TaskContext);

  const { mapRows, setMapRows, markedRows, setMarkedRows, vehicleRows, setVehicleRows,
    activeMarker, setActiveMarker,  setResetBounds, infoWeather,setInfoWeather, bouncieAuthNeeded,setBouncieAuthNeeded, visibleItems, setVisibleItems,
    visualTimestamp, setVisualTimestamp, radarControl, setRadarControl,  radarOpacity, setRadarOpacity, radarSpeed, setRadarSpeed, timestamps, setTimestamps,
    multipleMarkersOneLocation, setMultipleMarkersOneLocation, crewJobs, setCrewJobs, crewJobsRefetch, setCrewJobsRefetch, unfilteredJobs, setUnfilteredJobs,
    showCompletedJobs, setShowCompletedJobs,setShowingInfoWindow, crewJobSorters, setCrewJobSorters,
    getBorderColorBasedOnDate} = useContext(MapContext);

  const [crewExpanded, setCrewExpanded] = useState('activeJobPanel');
  const targetRef = React.useRef();
  const [dimensions, setDimensions] = useState({ width:500, height: 450 });

  const tableInfo = [
    // {field: 'ordernum', width: '6%', text: '#', type: 'number'},
    {field: 't_name', width: '16%', text: 'Job', type: 'text'},
    {field: 'job_type', width: '17%', text: 'Type', type: 'text'},
    {field: 'leader_name', width: '17%', text: 'Crew', type: 'text'},
    {field: 'job_date', width: '17%', text: 'Date', type: 'date'},
    {field: 'num_services', width: '15%', text: 'Services', type: 'number'},
    {field: 'completed', width: '12%', text: 'Completed', type: 'number'},
]
  
  
  //Swap Jobs
  const [jobAnchorEl, setJobAnchorEl] = React.useState(null);
  const [swapJobId, setSwapJobId] = useState(null); 

  //Popover Add/swap crew
  const [addSwapCrewAnchorEl, setAddSwapCrewAnchorEl] = React.useState(null);
  const [addSwapCrewJob, setAddSwapCrewJob] = useState(null);

  const [listHeight, setListHeight] = React.useState(425)

  //CSS
  const classes = useStyles();
  //FUNCTIONS

  //Gets size of our list container so that we can size our virtual list appropriately
  useLayoutEffect(() => {
    if (targetRef.current) { 
      setDimensions({
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight
      });
    }
  }, [targetRef.current]);

  //Swap Popover for Jobs
  const handleOpenSwapPopover = (event, job) =>{
    setJobAnchorEl(event.currentTarget);
    setSwapJobId(job.id);
  }
  const handleJobPopoverClose = () => {
      setJobAnchorEl(null);
      setSwapJobId(null);
  };
  //Swap Jobs
  const jobPopoverOpen = Boolean(jobAnchorEl);
  const jobPopoverId = open ? 'swap-popover' : undefined;

  const handleSwapJob = (event, crew, old_crew_id) => {
      if(!crew.id || !swapJobId){
          cogoToast.error("Could not swap.");
          console.error("Bad member or swapJobId for swap.");
          return;
      }
      
      Crew.updateCrewJob(crew.id, swapJobId, old_crew_id, user)
      .then((data)=>{
          //setCrewJobs(null);
          setCrewJobsRefetch(true);
          setShouldResetCrewState(true);
          setCrewToMap({...crewToMap});
      })
      .catch((error)=>{
          console.error(error);
          cogoToast.error("Failed to swap jobs");
      });
      if(jobPopoverOpen){
          handleJobPopoverClose();
      }
  }

 
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
    if(activeMarker?.type === "crew" && activeMarker?.item && panelRef.current){
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
  },[activeMarker, tabValue, expandedAnimDone, panelRef])

  const changeDateRange = (to, from) =>{
    setCrewJobDateRange({
      to: to ? new Date(to) : crewJobDateRange.to,
      from: from ? new Date(from) : crewJobDateRange.from
    })
    setCrewJobs(null);
    //setCrewJobsRefetch(true);
  }

  const handleChangePanel = (panel) => (event, isExpanded) => {
      setCrewExpanded(isExpanded ? panel : false);
    };

  const handleShowAllDates = (event)=>{
      if(!unfilteredJobs || !crewJobDateRange){
          console.error("Bad crew or jobs or dates in handleShowAllDates");
          return;
      }
      var minDate = moment() ;
      var maxDate = moment() ;

      //Get min and max dates for our jobs
      unfilteredJobs.filter((j)=> j.completed == 0).forEach((job)=>{
          var date = Util.convertISODateToMySqlDate(job.job_date) || null;
          
          if(date && moment(Util.convertISODateToMySqlDate(minDate)).isAfter( date )){
              minDate = date;
          }
          if(date && moment(Util.convertISODateToMySqlDate(maxDate)).isBefore(date)){
              maxDate = date;
          }

      });
      
      setCrewJobDateRange({
          to: moment(maxDate).format(),
          from: moment(minDate).format()
      })
      //setCrewJobsRefetch(true);
      setCrewJobs(null);

  }

  const getShowingSpan = () =>{
      if(!crewJobs){
          return "";
      }
      var jobList = [...crewJobs];
      var allJobList = unfilteredJobs?.filter((j)=>j.completed ==0);
      if(!jobList || !allJobList){
          return ""
      }
      if(jobList?.length == allJobList.length){
          return ("");
      }
      return(
          <><span className={classes.showingSpan}>Showing {jobList.length || ""} of {allJobList.length} Active Jobs</span>
                      <span className={classes.spanLink} onClick={event=> handleShowAllDates(event)}>(Set Date Range to Show All)</span></>)
  }


  //Modal
  const handleRightClick = (event, id) => {
    setModalTaskId(id);
    setModalOpen(true);

    //Disable Default context menu
    event.preventDefault();
  };
  ////


    const handleUpdateCrewJobDateRangeActive = (event)=>{
        if(!event){
            console.error("No event in handleUpdateCrewJobDateRangeActive")
            return;
        }
        var completed = event.target.checked ? true : false;

        setCrewJobDateRangeActive(completed)
        setCrewJobsRefetch(true);
        setResetBounds(true)
    }

  // const handleChangeShowComp = (event)=>{
  //   setShowCompletedJobs(event.target.checked);
  //   //setCrewJobs(null);
        //setCrewJobsRefetch(true)
  //   event.stopPropagation();
  // }

    //Add/Swap Popover for crews
    const handleOpenAddMemberPopover = (event, job, crew, type, task) =>{
        // if(){
        //   cogoToast.error("Failed to add/update crew job")
        //   console.error("Faile to add/update crew job on type");
        //   return;
        // }
        
        let job_id = job;
        let crew_id = crew;
        //set to -1 so we know we should add instead of swap or error
        if(job_id == null){
          job_id = -1;
        }
        if(crew_id == null){
          crew_id = -1
        }
        setAddSwapCrewAnchorEl(event.currentTarget);
        setAddSwapCrewJob({job_id : job_id, job_type: type, crew_id: crew_id, task_id: task});
        event.stopPropagation();
    }
    const handleAddMemberPopoverClose = () => {
        setAddSwapCrewAnchorEl(null);
        setAddSwapCrewJob(null);
    };

    //Swap Crews  
    const addSwapCrewPopoverOpen = Boolean(addSwapCrewAnchorEl);
    const addSwapCrewPopoverId = open ? 'add-popover' : undefined;

    const handleAddSwapCrew = React.useCallback((event, new_crew, old_crew_id) => {
        if(!new_crew.id || !addSwapCrewJob || !addSwapCrewJob.job_id || !addSwapCrewJob.job_type ){
          cogoToast.error("Could not swap.");
          console.error("Bad member or addSwapCrewJob for add/update.");
          return;
        }
        console.log(new_crew.id);
        console.log(addSwapCrewJob);
        // Update Job
        if(addSwapCrewJob.crew_id != -1){
          if(!old_crew_id){
            console.error("No old_crew_id given to handleAddSwapCrew");
          }
          //Update Function
          const updateJob = (id, old_crew_id)=>{
              Crew.updateCrewJob(id, addSwapCrewJob.job_id, old_crew_id, user)
                      .then((data)=>{
                          setShouldResetCrewState(true);
                          setCrewJobsRefetch(true)
                      })
                      .catch((error)=>{
                          console.error(error);
                          cogoToast.error("Failed to swap jobs");
              });
          }

          //Dalete Function
          //we dont delete anymore because we can set crew_id to NULL now
        //   const deleteJob = (id, old_crew_id)=>{
        //     Crew.deleteCrewJob(id, old_crew_id, user)
        //             .then((data)=>{
        //                 setShouldResetCrewState(true);
        //                 //setTaskListTasks(null);
        //                 setCrewJobsRefetch(true)
        //             })
        //             .catch((error)=>{
        //                 console.error(error);
        //                 cogoToast.error("Failed to swap jobs");
        //     });
        //}

          //if we have to create new crew and update job
          if(new_crew.id == -1 ){
              Crew.addNewCrew()
              .then((data)=>{
                  if(!isNaN(data)){
                      var id = data;
                      //Update Job
                      updateJob(id,old_crew_id);
                  }
              })
              .catch((error)=>{
                  console.error("handleAddOrCreateCrew", error);
                  cogoToast.error("Failed to Create and Add to Crew");
              })
              
          }else{
            if(new_crew.id == -2){
              //Delete
              //deleteJob(addSwapCrewJob.job_id, old_crew_id)
              updateJob(null, old_crew_id);
            }else{
              //Just Update
              updateJob(new_crew.id, old_crew_id);
            }
            
          }
          
        }
        
        
        //Create Job 
        if(addSwapCrewJob.crew_id == -1){
          //add job function
          const addJobs = (id) => {
            Crew.addCrewJobs([addSwapCrewJob.task_id], addSwapCrewJob.job_type, id)
                .then((response)=>{
                    if(response){
                        cogoToast.success("Created and added to crew");
                        setShouldResetCrewState(true);
                        setCrewJobsRefetch(true);
                    }
                })
                .catch((err)=>{
                    console.error("Failed to add to creww", err);
                    cogoToast.error("Failed to add to crew")
                })
          }

          //If we need to create new crew
          if(new_crew.id == -1 ){
              //Add Crew + return id
              Crew.addNewCrew()
              .then((data)=>{
                  if(!isNaN(data)){
                      var id = data;
                      //Add Jobs
                      addJobs(id);
                  }
              })
              .catch((error)=>{
                  console.error("handleAddOrCreateCrew", error);
                  cogoToast.error("Failed to Create and Add to Crew");
              })
              //Just add from existing crew
          }else{
              addJobs(new_crew.id);
          }
        }
        if(addSwapCrewPopoverOpen){
          handleAddMemberPopoverClose();
        }
        
    },[addSwapCrewJob])
    //// END OF Add/Swap Popover for crews

    const handleUpdateJobCompleted =(event, job_id, crew_id)=>{
        var completed = event.target.checked ? 1 : 0;

        Crew.updateCrewJobCompleted(completed, job_id, crew_id, user )
        .then((data)=>{
            
            setCrewJobsRefetch(true)
            cogoToast.success("Successfully update crew job");

        })
        .catch((error)=>{
            console.error("Failed to update completed of crew job");
            cogoToast.error("Failed to update crew job");
        })
    } 

    return(
      <>
      {/* { crewJobs && crewToMap && <>
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
                    } */}
               <>
                <Accordion expanded={crewExpanded === 'activeJobPanel'} onChange={handleChangePanel('activeJobPanel')}>
                <AccordionSummary
                className={classes.expandedSummary}
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                ><div>
                    <span className={clsx({[classes.expansionTitleSpan]: crewExpanded !== 'activeJobPanel',
                                            [classes.expandedTitleSpanSelected]: crewExpanded === 'activeJobPanel'})}>
                        Active Jobs
                    </span>
                </div>
                </AccordionSummary>
                <AccordionDetails
                ref={panelRef}
                className={classes.expansionDetail}>
                    <div className={classes.crewOptionsContainer}>
                    
                        
                        <div className={classes.dateRangeContainer}>
                                <div className={classes.dateRangeCheckbox}><Checkbox
                                    icon={<CheckBoxOutlineBlankIcon fontSize="medium" className={classes.icon} />}
                                    checkedIcon={<CheckBoxIcon fontSize="medium" className={classes.iconChecked} />}
                                    name="checkedI"
                                    classes={{root: classes.checkboxSpan}}
                                    checked={crewJobDateRangeActive}
                                    onChange={(event)=> handleUpdateCrewJobDateRangeActive(event)}
                                /></div>{ !crewJobDateRangeActive ? <><span className={classes.inputSpan}>Date Range</span> </>
                                
                                :
                                <>
                                <div className={classes.dateRangeDiv}>
                                        <div className={classes.inputDiv}>
                                        <span className={classes.inputSpan}>FROM:</span>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <DatePicker    format="MM/dd/yyyy"
                                                            clearable
                                                            showTodayButton
                                                            inputVariant="outlined"
                                                            variant="modal" 
                                                            maxDate={new Date('01-01-2100')}
                                                            minDate={new Date('01-01-1970')}
                                                            className={classes.inputField}
                                                            value={crewJobDateRange.from} 
                                                            onChange={value => changeDateRange(null, value)} />
                                        </MuiPickersUtilsProvider>
                                        </div>
                                        <div className={classes.inputDiv}>
                                        <span className={classes.inputSpan}>TO:</span>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <DatePicker    format="MM/dd/yyyy"
                                                            clearable
                                                            showTodayButton
                                                            inputVariant="outlined"
                                                            variant="modal" 
                                                            maxDate={new Date('01-01-2100')}
                                                            minDate={new Date('01-01-1970')}
                                                            className={classes.inputField}
                                                            value={crewJobDateRange.to} 
                                                            onChange={value => changeDateRange(value, null)} />
                                        </MuiPickersUtilsProvider>
                                    </div>
                                </div> </>
                            }
                        </div>
                        <div className={classes.crewFilterDiv}>
                            <MapSidebarCrewFilter />
                        </div>
                    </div>
                    {/* <div className={classes.showingDiv}>{ getShowingSpan() } </div> */}
                    
                <>
                {/* <MUIList key={'joblist'} style={{maxHeight: `${listHeight}px`}} className={classes.jobList}>  */}
                { crewJobs  ? 
                    <div ref={targetRef}>
                       <CrewJobsRows handleRightClick={handleRightClick} handleOpenAddMemberPopover={handleOpenAddMemberPopover}
                         dimensions={dimensions} setDimensions={setDimensions} classes={classes} tableInfo={tableInfo}  handleUpdateJobCompleted={handleUpdateJobCompleted}/>
                    </div>
                : <></>}
                        {/* </MUIList>  */}
                        {/* <div><span onClick={event => handleToggleExpandList()}>Expand</span></div> */}
                        
                       
            <Popover
                id={jobPopoverId}
                open={jobPopoverOpen}
                anchorEl={jobAnchorEl}
                onClose={handleJobPopoverClose}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
                }}
                transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
                }}
                className={classes.swapPopover}
                classes={{paper: classes.swapPopoverPaper}}
            >
                <MUIList subheader={
                        <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                            Swap Crews
                        </ListSubheader>}
                    >
                    {crewToMap && allCrews && allCrews.filter((fil_mem, i)=>{
                                return(fil_mem.id != crewToMap.id)
                            }).map((crew, i)=>(
                            <ListItem className={classes.member_list_item} 
                                        key={`crew_members+${i}`} button
                                        onMouseUp={(event)=>handleSwapJob(event, crew, crewToMap.id)}>
                                <ListItemText primary={crew.crew_leader_name ? crew.crew_leader_name : 'Crew ' + crew.id} />
                            </ListItem>
                        ))}
                </MUIList>
            </Popover>
            <Popover
            id={addSwapCrewPopoverId}
            open={addSwapCrewPopoverOpen}
            anchorEl={addSwapCrewAnchorEl}
            onClose={handleAddMemberPopoverClose}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
            }}
            className={classes.popover}
            classes={{paper: classes.popoverPaper}}
        >
            <MUIList 
                subheader={
                    <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                        Add/Update Crew
                    </ListSubheader>
                }>
                  { addSwapCrewJob && addSwapCrewJob.crew_id &&
                    <ListItem className={classes.crew_list_item} onMouseUp={(event)=>handleAddSwapCrew(event, {id: -2})}>
                    <ListItemText button primary={'*Remove Crew*'}/>
                    </ListItem>
                  }
                  <ListItem className={classes.crew_list_item} onMouseUp={(event)=>handleAddSwapCrew(event, {id: -1})}>
                          <ListItemText button primary={'*Create New*'}/>
                      </ListItem>
                {addSwapCrewJob && addSwapCrewJob.crew_id && allCrews && allCrews.filter((fil_crew, i)=>{
                              return(fil_crew.id != addSwapCrewJob.crew_id || addSwapCrewJob.crew_id == -1)
                          }).map((crew, i)=>(
                          <ListItem className={classes.crew_list_item} 
                                      key={`crew_members+${i}`} button
                                      onMouseUp={(event)=>handleAddSwapCrew(event, crew, addSwapCrewJob.crew_id )}>
                              <ListItemText primary={crew.crew_leader_name ? crew.crew_leader_name : 'Crew ' + crew.id} />
                          </ListItem>
                      ))}
            </MUIList>
        </Popover> </>
            </AccordionDetails>
            </Accordion>
            <Accordion expanded={crewExpanded === 'completedPanel'} onChange={handleChangePanel('completedPanel')}>
                <AccordionSummary
                className={classes.expandedSummary}
                expandIcon={<ExpandMoreIcon />}
                aria-controls="completedPanel-content"
                id="completedPanel-header"
                >
                <span className={clsx({[classes.expansionTitleSpan]: crewExpanded !== 'completedPanel',
                                            [classes.expandedTitleSpanSelected]: crewExpanded === 'completedPanel'})}>Completed Jobs</span>
                </AccordionSummary>
                <AccordionDetails
                    className={classes.expansionDetail}>

                        {/*Head Item*/}
                        <div key={'headItem'} 
                                      dense
                                      className={ classes.headListItem }>
                                                
                                                <div className={classes.listItemInfoDiv}>
                                                    {tableInfo.map((item, i)=>{
                                                        //const isSorted =  crewJobSorters && crewJobSorters[0] && crewJobSorters[0].property == item.field;
                                                        //const isASC = crewJobSorters && crewJobSorters[0] && crewJobSorters[0].direction === 'ASC';
                                                        return(
                                                        <div      id={"Head-ListItem"+i} 
                                                                        align="center"
                                                                        key={item.field + i +'_head'}
                                                                        className={clsx({ [classes.headlistItemText]: true, [classes.listItemTextPrimary]: true})} 
                                                                        style={{flex: `0 0 ${item.width}`}} 
                                                                        //onClick={event=>handleListSort(event, item)}
                                                                        >
                                                                            <span>
                                                                        {item.text}
                                                                        {/* {isSorted ?
                                                                            <div>
                                                                                {isASC ? <ArrowDropDownIcon/> : <ArrowDropUpIcon/>}
                                                                            </div> 
                                                                            : <></>} */}
                                                                            </span>
                                                        </div>
                                                    )})}
                                                   
                                                </div>
                                                <div className={classes.secondary_div}>

                                                    <IconButton className={classes.secondary_button} edge="end" aria-label="edit" >
                                                    <EditIcon />
                                                    </IconButton>
                                                    
                                                </div>
                                </div>
                            {/*End of Head Item */}
                            
                    <MUIList className={classes.completedList}> 
                    
                            
                    {unfilteredJobs && unfilteredJobs.filter((j)=> j.completed == 1).map((row, index) => {
                                const labelId = `checkbox-list-label-${row.id}`;
                                const date = row?.job_date;
                                
                                const datePassed = date && (new Date(date) < new Date());
                                const borderColor = getBorderColorBasedOnDate(date);
                                const selected = activeMarker?.job?.id === row.id;
                                return (
                                <ListItem key={`${row.id + '_' + index}test`} 
                                            role={undefined} dense button 
                                            // onClick={event => handleSelectJob(event, row)}
                                            onContextMenu={event => handleRightClick(event, row.task_id)}
                                            selected={activeMarker && activeMarker?.job?.id === row.id}
                                            className={ clsx( {[classes.selectedRow]: selected },
                                                {[classes.nonSelectedRow]: !selected},

                                                {[classes.datePassedRow]: !selected && moment(date).isBefore(moment()) },
                                                {[classes.datePassedSelectedRow]: selected && moment(date).isBefore(moment()) },

                                            )}
                                            >
                                        {tableInfo.map((item, i)=>{
                                            return(
                                            <div      id={"Head-ListItemComp"+i} 
                                                            align="center"
                                                            key={item.field + i +'_head_completed'}
                                                            className={clsx({ [classes.headlistItemText]: true, })} 
                                                            style={{flex: `0 0 ${item.width}`}} 
                                                            >
                                                                <span>
                                                                    { item.field === "completed" ?
                                                                            <Checkbox
                                                                            icon={<CheckBoxOutlineBlankIcon fontSize="medium" className={classes.icon} />}
                                                                            checkedIcon={<CheckBoxIcon fontSize="medium" className={classes.iconChecked} />}
                                                                            name="checkedI"
                                                                            classes={{root: classes.checkboxSpan}}
                                                                            checked={row.completed}
                                                                            onChange={(event)=> handleUpdateJobCompleted(event, row.id, row.crew_id)}
                                                                            />
                                                                    :
                                                                     item.field === "job_date" ?
                                                                        row[item.field] ? moment(row[item.field]).format('MM-DD-YYYY') : ''
                                                                     :row[item.field]}
                                                                </span>
                                            </div>
                                            )})}
                                    <ListItemSecondaryAction className={classes.secondary_div}>
                                            
                                        {/* <Checkbox
                                            icon={<CheckBoxOutlineBlankIcon fontSize="medium" className={classes.icon} />}
                                            checkedIcon={<CheckBoxIcon fontSize="medium" className={classes.iconChecked} />}
                                            name="checkedI"
                                            checked={row.completed}
                                            onChange={(event)=> handleUpdateJobCompleted(event, row.id, row.crew_id)}
                                        /> */}

                                        {/* <IconButton onClick={event => handleOpenSwapPopover(event, row)} >
                                            <SwapIcon edge="end" aria-label="edit" />
                                        </IconButton> */}
                                            
                                            
                                        <IconButton className={classes.secondary_button} edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.task_id)}>
                                        <EditIcon />
                                        </IconButton>
                                        
                                        {/* <IconButton className={classes.secondary_button} edge="end" aria-label="delete" onClick={event => handleRemoveCrewJob(event, row.id)}>
                                            <DeleteIcon />
                                        </IconButton>  */}
                                        
                                    </ListItemSecondaryAction>
                                </ListItem>
                                )})}
                                </MUIList>   
                </AccordionDetails>
            </Accordion>
            </> 
        </>
    );

}
export default MapSiderbarCrewJobs;


const CrewJobsRows = React.memo( ({handleRightClick,handleOpenAddMemberPopover, dimensions, setDimensions, classes, tableInfo, handleUpdateJobCompleted})=>{


    const { crewMembers,setCrewMembers, allCrewJobs, allCrews, setAllCrews,  setAllCrewJobs, allCrewJobMembers, setAllCrewJobMembers, setShouldResetCrewState, crewJobDateRange, setCrewJobDateRange,
    crewJobDateRangeActive, setCrewJobDateRangeActive
        } = useContext(CrewContext);

    const { selectedIds, setSelectedIds, taskListToMap, setTaskListToMap, taskListTasksSaved,crewToMap, setCrewToMap,
     setModalOpen, setModalTaskId,   sorters, setSorters, job_types, user} = useContext(TaskContext);

    const { mapRows, setMapRows, markedRows, setMarkedRows, vehicleRows, setVehicleRows,
    activeMarker, setActiveMarker,  setResetBounds, infoWeather,setInfoWeather, bouncieAuthNeeded,setBouncieAuthNeeded, visibleItems, setVisibleItems,
    visualTimestamp, setVisualTimestamp, radarControl, setRadarControl,  radarOpacity, setRadarOpacity, radarSpeed, setRadarSpeed, timestamps, setTimestamps,
    multipleMarkersOneLocation, setMultipleMarkersOneLocation, crewJobs, setCrewJobs, crewJobsLoading, setCrewJobsLoaded, crewJobsRefetch, setCrewJobsRefetch, unfilteredJobs, setUnfilteredJobs,
    showCompletedJobs, setShowCompletedJobs,setShowingInfoWindow, crewJobSorters, setCrewJobSorters} = useContext(MapContext);
    

    const handleToggle = (id, event) => {     
        var job = crewJobs.filter((row, i) => row.id === id)[0];
        setActiveMarker({type: 'crew', item: job});
        setShowingInfoWindow(true);

    };

    const handleGetChangeCrewDiv = (job ) =>{

        const typeColor = job.crew_color || '#555';
        
        let return_value = "";
        if(!job.completed){
            if(job.crew_id){
                if(job.crew_leader_id != null){
                return_value = <div className={classes.popOverDiv}
                                    style={{ 
                                        color: '#fff',
                                        backgroundColor: `${typeColor}`}}
                                    onMouseUp={event => handleOpenAddMemberPopover(event, job.id, job.crew_id, job.job_type, job.task_id)}>
                                {job.leader_name}
                                </div>;
                }else{
                return_value = <div className={classes.popOverDiv} 
                                    style={{
                                        color: '#fff',
                                        backgroundColor: `${typeColor}`}}
                                onMouseUp={event => handleOpenAddMemberPopover(event, job.id, job.crew_id, job.job_type, job.task_id)}>
                                    { job?.crew_id ? 'Crew ' + job?.crew_id?.toString() : <>&nbsp;</> }
                                </div>;
                }
            }else{
                return_value = <div className={classes.popOverDiv} 
                                    style={{
                                        color: '#000',
                                        backgroundColor: `#eee`}}
                                onMouseUp={event => handleOpenAddMemberPopover(event, job.id, job.crew_id, job.job_type, job.task_id)}>
                                    { job?.crew_id ? 'Crew ' + job?.crew_id?.toString() : <>&nbsp;</> }
                                </div>;
            }
            return return_value;
          }else{
            if(job.crew_leader_id != null){
              return_value = <span>{job.leader_name}</span>;
            }else{
              return_value = <span>{ job?.crew_id ? 'Crew ' + job?.crew_id?.toString() : <>&nbsp;</> }</span>;
            }
            return return_value;
          }

    }

    //For generating keys, so that the list will rerender on crewJobs and crewJobsRefetch
    const getRand = React.useMemo(() => Math.floor((Math.random() * 100) + 1),[crewJobs, crewJobsRefetch]);

    const handleUpdateTaskDate = React.useCallback((value, crewJob, fieldId) =>{
        if(!crewJob){
            console.error("No crewJob, Failed to update", crewJob);
        }
        let updateJobDate = Util.convertISODateToMySqlDate(value);
        let updateJobId = crewJob.id;

        if(updateJobId == null){
            //create crew job with date
            Crew.addCrewJobs([crewJob.task_id], fieldId, null, updateJobDate)
            .then((response)=>{
                if(response){
                    cogoToast.success("Created and added to crew");
                    //setTaskListTasks(null);
                    setCrewJobsRefetch(true);
                    setShouldResetCrewState(true);
                }
            })
            .catch((err)=>{
                console.error("Failed to add to creww", err);
            })

        }else{
            //update existing crew job
            Crew.updateCrewJobDate( updateJobId, updateJobDate, user)
            .then((data)=>{
                cogoToast.success(`Updated ${fieldId} date`)
                setCrewJobsRefetch(true);
                setShouldResetCrewState(true);
            })
            .catch((error)=>{
                console.error("Failed to update crewJob", error);
                cogoToast.error("Failed to update crewJob");
            })
        }


    },[crewJobs])

    
  

    //// DRAG N DROP
    // a little function to help us with reordering the result
    const reorder = (list, startIndex, endIndex) => {
        if(!crewToMap){
            cogoToast.info(`No crew to reorder`, {hideAfter: 4});
            return;
        }
        const result = unfilteredJobs.filter((j)=>j.completed == 0);

        //This part is dependent on the index and ordernum matching up
        var start = list[startIndex].ordernum;
        var end = list[endIndex].ordernum;

        if(start == undefined || start == null){
            console.error("Bad start index in reorder");
        }
        if(end == undefined || end == null){
            console.error("Bad start index in reorder");
        }

        const [removed] = result.splice(start-1, 1);
        result.splice(end-1, 0, removed);
        return result;
    };

    const grid = 8;

    const getItemStyle = (isDragging, draggableStyle) => {
        
        return({
        // some basic styles to make the items look a bit nicer
        userSelect: "none",
        //padding: '3px',
        margin: `0 0 2px 0`,

        // change background colour if dragging
        background: isDragging ? "lightgreen" : "grey",
        // styles we need to apply on draggables
        ...draggableStyle,
        top: isDragging ? draggableStyle["top"] - (draggableStyle["top"] * .25) : '',
        left: isDragging ? '1800px' : '',
    })};
                
    const getListStyle = isDraggingOver => ({
        background: isDraggingOver ? "#fff" : "lightgrey",
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
        if(!unfilteredJobs){
            console.error("no unfiltered items");
            return;
        }

        const items = reorder( crewJobs, result.source.index, result.destination.index );

        var temp = items.map((item, i)=> item.id);
        if(!temp){
            console.error("Failed to reorder, bad temp list to update")
            return;
        }


        Crew.reorderCrewJobs(temp,crewToMap.id)
        .then( (ok) => {
            if(!ok){
                throw new Error("Could not reorder crew" + crewToMap.id);
            }
            cogoToast.success(`Reordered Crew Jobs`, {hideAfter: 4});

            setCrewJobsRefetch(true);
            setCrewToMap({...crewToMap});
        })
        .catch( error => {
            console.error(error);
            cogoToast.warn(`Could not reorder crew jobs`, {hideAfter: 4});
        });
            
    }
    // END DND

    //Sort Crew Jobs
    useEffect(()=>{
        if (Array.isArray(crewJobSorters) && crewJobSorters.length) {
            if (crewJobs && crewJobs.length) {
                var tmpData = crewJobs.sort(createSorter(...crewJobSorters))
                var copyObject = [...tmpData];
                setCrewJobs(copyObject);
                console.log("SETTING FORREAL SORTED DATA", copyObject)
                console.log("using sorters", crewJobSorters)
                cogoToast.success(`Sorting by ${crewJobSorters.map((v, i)=> v.property + ", ")}`);
            }
        }

    },[crewJobSorters]);

    const handleListSort = (event, item) =>{
        if(!item){
            cogoToast.error("Bad field while trying to sort");
            return;
        }
        //sort taskListItems according to item
        //this sort can take multiple sorters but i dont think its necessary
           // if it is, you will have to change the [0] to a dynamic index!
        if(item.type == 'date' || item.type == 'number' || item.type == 'text'){
            setCrewJobSorters([{
                property: item.field, 
                direction: crewJobSorters && crewJobSorters[0] && crewJobSorters[0].property == item.field ? 
                ( crewJobSorters[0].direction === 'DESC' ? "ASC" : crewJobSorters[0].direction === 'ASC' ? "DESC" : "ASC" ) : "ASC"
            }]);   
        }
    }

    const getRowRender = (jobs) => ({index,style}) =>{
        const row = jobs[index];

        if (!row) {
            return null;
        }

        //const isItemSelected = activeMarker?.item?.id === row.id;
        return(
            <Draggable key={row.id + '_'+ index+ 'draggable' + row.job_type } 
                            draggableId={row.id.toString()} 
                            index={index} 
                            isDragDisabled={true}>
                {(provided, snapshot) => { 
                    const date = row.job_date;
                    const datePassed = date && (new Date(date) < new Date());
                    const selected = activeMarker?.item?.id === row.id;
                    const labelId = `checkbox-list-label-${row.id}`;
                    return (
                    <div key={row.id + index } 
                                role={undefined} dense button 
                                // onClick={event => handleSelectJob(event, row)}
                                id={"mapCrewJobItem"+row.id}
                                onClick={event => handleToggle(row.id, event)}
                                onContextMenu={event => handleRightClick(event, row.task_id)}
                                selected={activeMarker && activeMarker?.item?.id === row.id}
                                className={ clsx( {[classes.listRow]: true, [classes.selectedRow]: selected },
                                    {[classes.nonSelectedRow]: !selected},
                                    {[classes.datePassedRow]: !selected && moment(date).isBefore(moment()) },
                                    {[classes.datePassedSelectedRow]: selected && moment(date).isBefore(moment()) },

                                    {[classes.datePassed2Row]: !selected && moment(date).isAfter(moment()) && moment(date).isBefore(moment().add(2, "day")) },
                                    {[classes.datePassed2SelectedRow]: selected && moment(date).isAfter(moment()) && moment(date).isBefore(moment().add(2, "day")) },

                                    {[classes.datePassed3Row]: !selected && moment(date).isAfter(moment().add(2, "day")) && moment(date).isBefore(moment().add(5, "day")) },
                                    {[classes.datePassed3SelectedRow]: selected && moment(date).isAfter(moment().add(2, "day")) && moment(date).isBefore(moment().add(5, "day")) },

                                    {[classes.datePassed4Row]: !selected && moment(date).isAfter(moment().add(5, "day")) },
                                    {[classes.datePassed4SelectedRow]: selected && moment(date).isAfter(moment().add(5, "day")) },
                                )}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{...getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                                ), ...style}}>
                        <div id={labelId} className={classes.listItemText}>
                                <div className={classes.listItemDiv}>
                                
                                <div className={classes.listItemInfoDiv}>
                                    {/* <div className={classes.listItemOrderNumDiv}><span>{row.ordernum}</span></div> */}
                                    <div className={classes.task_name_div}><span>{row.t_name}</span></div>
                                    <div className={classes.job_list_task_info}>
                                        <span className={classes.jobTypeSpan}>
                                            <MapSidebarCrewJobsTypePopover user={user} crewJob={row}/>
                                        </span>
                                    </div>
                                    <div className={classes.job_list_task_info}> {handleGetChangeCrewDiv(row) }</div>
                                    <div className={classes.job_list_task_info}>   
                                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <TLCrewJobDatePicker  showTodayButton
                                                clearable
                                                inputVariant="outlined"
                                                variant="modal" 
                                                title={`Select ${row.job_type == 'install' ? "Install" : "Drill"} Date`}
                                                maxDate={new Date('01-01-2100')}
                                                minDate={new Date('01-01-1970')}
                                                className={classes.datePicker}
                                                value={ row.job_type == 'install' ? row.sch_install_date ? moment(row.sch_install_date).format('MM-DD-YYYY hh:mm:ss') : null : row.drill_date ? moment(row.drill_date).format('MM-DD-YYYY hh:mm:ss') : null } 
                                                onChange={value => handleUpdateTaskDate(Util.convertISODateTimeToMySqlDateTime(value), row, row.job_type == 'install' ? "install" : "drill")} 
                                                //onCompleteTasks={ ()=> handleCompleteJob(task,fieldId) }
                                                />
                                            </MuiPickersUtilsProvider>
                                        </div>
                                    <div className={classes.job_list_task_info}> 
                                        <MapSidebarCrewJobsServiceCounter  crewJob={row}/>
                                        </div>
                                    <div className={classes.job_list_task_completed}>
                                    <Checkbox
                                        icon={<CheckBoxOutlineBlankIcon fontSize="medium" className={classes.icon} />}
                                        checkedIcon={<CheckBoxIcon fontSize="medium" className={classes.iconChecked} />}
                                        name="checkedI"
                                        classes={{root: classes.checkboxSpan}}
                                        checked={row.completed}
                                        onChange={(event)=> handleUpdateJobCompleted(event, row.id, row.crew_id)}
                                        />
                                    </div>
                                    </div>
                                </div>
                        </div>
                        <div className={classes.secondary_div}>
                            {/* <Tooltip title="Mark as Completed" >
                            <Checkbox
                                icon={<CheckBoxOutlineBlankIcon fontSize="medium" className={classes.icon} />}
                                checkedIcon={<CheckBoxIcon fontSize="medium" className={classes.iconChecked} />}
                                name="checkedI"
                                checked={row.completed}
                                onChange={(event)=> handleUpdateJobCompleted(event, row.id, row.crew_id)}
                            /></Tooltip> */}

                            {/* <IconButton onClick={event => handleOpenSwapPopover(event, row)} >
                                <SwapIcon edge="end" aria-label="edit" />
                            </IconButton>
                                    */}
                                
                            <IconButton className={classes.secondary_button} edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.task_id)}>
                                <EditIcon />
                            </IconButton>
                            
                        </div>
                    </div>
                    )}}
                    </Draggable>
        )
    };

    return(
         <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable" mode="virtual"
                            renderClone={(provided, snapshot, rubric) => (
                            <div
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                            >
                                <ListItem key={crewJobs[rubric.source.index].id } 
                                                role={undefined} dense button 
                                                className={classes.nonSelectedRow}
                                                >
                                    <ListItemText>
                                            {crewJobs[rubric.source.index].id} | {crewJobs[rubric.source.index].t_name} 
                                    </ListItemText>
                                </ListItem>
                            </div>
                            )}>
                            {(provided, snapshot) => {
                                const itemCount = snapshot.isUsingPlaceholder
                                ? crewJobs.length + 1
                                : crewJobs.length;
                                
                                return(
                            <>
                            {/*Head Item*/}
                            <div key={'headItem'} 
                                      dense
                                      className={ classes.headListItem }>
                                                
                                                <div className={classes.listItemInfoDiv}>
                                                    {tableInfo.map((item, i)=>{
                                                        const isSorted =  crewJobSorters && crewJobSorters[0] && crewJobSorters[0].property == item.field;
                                                        const isASC = crewJobSorters && crewJobSorters[0] && crewJobSorters[0].direction === 'ASC';
                                                        return(
                                                        <div      id={"Head-ListItem"+i} 
                                                                        align="center"
                                                                        key={item.field + i +'_head'}
                                                                        className={clsx({ [classes.headlistItemText]: true, [classes.listItemTextPrimary]: true})} 
                                                                        style={{flex: `0 0 ${item.width}`}} 
                                                                        onClick={event=>handleListSort(event, item)}
                                                                        >
                                                                            <span>
                                                                        {item.text}
                                                                        {isSorted ?
                                                                            <div>
                                                                                {isASC ? <ArrowDropDownIcon/> : <ArrowDropUpIcon/>}
                                                                            </div> 
                                                                            : <></>}
                                                                            </span>
                                                        </div>
                                                    )})}
                                                   
                                                </div>
                                                <div className={classes.secondary_div}>

                                                    <IconButton className={classes.secondary_button} edge="end" aria-label="edit" >
                                                    <EditIcon />
                                                    </IconButton>
                                                    
                                                </div>
                                </div>
                            {/*End of Head Item */}
                            
                                    <List
                                    height={dimensions?.height - 20}
                                    rowCount={itemCount}
                                    rowHeight={30}
                                    width={dimensions?.width}
                                    ref={(ref) => {
                                        // react-virtualized has no way to get the list's ref that I can so
                                        // So we use the `ReactDOM.findDOMNode(ref)` escape hatch to get the ref
                                        if (ref) {
                                        // eslint-disable-next-line react/no-find-dom-node
                                        const whatHasMyLifeComeTo = ReactDOM.findDOMNode(ref);
                                        if (whatHasMyLifeComeTo) {
                                            provided.innerRef(whatHasMyLifeComeTo);
                                        }
                                        }
                                    }}
                                    rowRenderer={getRowRender(crewJobs)}
                                    />
                            </>
                            )}}
                        </Droppable>
                    </DragDropContext>
    )
})


const useStyles = makeStyles(theme => ({
  root: {
      margin: '10px 0px 10px 0px',
      color: '#535353',
      width: '100%',
  },
  items:{
      color: '#fcfcfc'
  },
  // selectedRow:{
  //       border: '1px solid #fbff08',
  //       backgroundColor: '#bff6ff !important',
  //       '&:hover':{
  //           border: '1px solid #fbff08',
  //       },
  //       boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
  //   },
  //   nonSelectedRow:{
  //       border: '1px solid #91979c',
  //       backgroundColor: '#fff !important',
  //       '&:hover':{
  //           border: '1px solid #ececec',
  //       },
  //       boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
  //   },
  //   datePassedRow:{
  //       backgroundColor: '#bbb !important',
  //   },
  //   datePassedSelectedRow:{
  //       backgroundColor: '#b6d1d6 !important',
  //   },
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
        textAlign: 'center',
        flexBasis: '17%',
        '& span':{
            fontWeight: '500',
        }
    },
    job_list_task_completed:{
        textAlign: 'center',
        flexBasis: '12%',
        '& span':{
            fontWeight: '500',
        }
    },
    headListItemSpan:{
      color: '#fff',
    },
    drillSpan:{
        color: '#216fac',
    },
    // listItemText:{
    //   marginTop: 0,
    //   marginBottom: 0,
    // },
    // showCompletedDiv:{
    //   display: 'flex',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   background: '#cef3eb',
    // },
    // showCompletedSpan:{
    //   fontSize: '.8em',
    //   fontFamily: 'sans-serif',
    //   color: '#333'
    // }
    list_head:{
      lineHeight: '24px',
      borderRadius: '5px',
  },
  text_button:{
      textAlign: 'center',
      cursor: 'pointer',
      fontSize: '12px',
      color: '#677fb3',
      margin: '0% 3% 0% 0%',
      '&:hover':{
          color: '#697fb1',
          textDecoration: 'underline',
          backgroundColor: '#cecece',
      }
  },
  text_button_li:{
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      position: 'sticky',
      bottom: '0px',
      backgroundColor: '#dedede',
  },
  member_list_item:{
      backgroundColor: '#f9ebca',
      '&:hover':{
          backgroundColor: '#e9c46c',
          color: '#404654',
      },
      padding: '0% 5%',
      border: '2px solid #b2b2b2'
  },
  member_select_list_item:{
      backgroundColor: '#ffa93e',
      '&:hover':{
          backgroundColor: '#e18a1e',
          color: '#404654',
      },
      padding: '0% 5%',
      border: '2px solid #b2b2b2'
  },
  secondary_div:{
      flexBasis: '5%',
  },
  secondary_button:{
      padding: '5px',
      margin: '1%'
  },
  jobList:{
      //maxHeight: 359,
      overflowY: 'scroll',
  },
  completedList:{
      maxHeight: 359,
      overflowY: 'scroll',
      padding: '5px',
      width: '100%',
  },
  job_list_head:{
      backgroundColor: '#327370',
      color: '#fff',
      fontSize: '1.4em',
      fontWeight: '600',
  },
  job_root: {
      // margin: '0% 5%',
      color: '#535353',
      padding: '.6%',
      backgroundColor: '#fff',
      borderRadius: '4px',
      //boxShadow: '0px 1px 3px 0px #000000db',
      maxHeight: '700px',
  },
  items:{
      color: '#fcfcfc'
  },
  listRow:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  selectedRow:{
      borderTop: '1px solid #fff',
      borderBottom: '1px solid #fff',
      borderLeft: '4px solid #fff',
      borderRight: '4px solid #fff',
      backgroundColor: '#bff6ff !important',
      '&:hover':{
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          borderLeft: '4px solid #ddd',
          borderRight: '4px solid #ddd',
      },
      boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
  },
  nonSelectedRow:{
      borderTop: '1px solid #fff',
      borderBottom: '1px solid #fff',
      borderLeft: '4px solid #fff',
      borderRight: '4px solid #fff',
      backgroundColor: '#fff !important',
      '&:hover':{
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          borderLeft: '4px solid #ddd',
          borderRight: '4px solid #ddd',
      },
      boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
  },
  datePassedRow:{
      backgroundColor: '#fff !important',
      borderTop: '1px solid #ff0000',
      borderBottom: '1px solid #ff0000',
      borderLeft: '4px solid #ff0000',
      borderRight: '4px solid #ff0000',
      '&:hover':{
        backgroundColor: '#ddd !important',
        borderTop: '1px solid #990000',
        borderBottom: '1px solid #990000',
        borderLeft: '4px solid #990000',
        borderRight: '4px solid #990000',
      },
  },
  datePassedSelectedRow:{
      backgroundColor: '#b6d1d6 !important',
      borderTop: '1px solid #ff0000',
      borderBottom: '1px solid #ff0000',
      borderLeft: '4px solid #ff0000',
      borderRight: '4px solid #ff0000',
      '&:hover':{
        backgroundColor: '#b2c1c6 !important',
        borderTop: '1px solid #990000',
        borderBottom: '1px solid #990000',
        borderLeft: '4px solid #990000',
        borderRight: '4px solid #990000',
      },
  },
  datePassed2Row:{
    backgroundColor: '#fff !important',
    borderTop: '1px solid #ff8000',
    borderBottom: '1px solid #ff8000',
    borderLeft: '4px solid #ff8000',
    borderRight: '4px solid #ff8000',
    '&:hover':{
      backgroundColor: '#ddd !important',
      borderTop: '1px solid #995000',
      borderBottom: '1px solid #995000',
      borderLeft: '4px solid #995000',
      borderRight: '4px solid #995000',
    },
},
datePassed2SelectedRow:{
    backgroundColor: '#b6d1d6 !important',
    borderTop: '1px solid #ff8000',
    borderBottom: '1px solid #ff8000',
    borderLeft: '4px solid #ff8000',
    borderRight: '4px solid #ff8000',
    '&:hover':{
      backgroundColor: '#b2c1c6 !important',
      borderTop: '1px solid #995000',
      borderBottom: '1px solid #995000',
      borderLeft: '4px solid #995000',
      borderRight: '4px solid #995000',
    },
},
datePassed3Row:{
      backgroundColor: '#fff !important',
      borderTop: '1px solid #fff600',
      borderBottom: '1px solid #fff600',
      borderLeft: '4px solid #fff600',
      borderRight: '4px solid #fff600',
      '&:hover':{
        backgroundColor: '#ddd !important',
        borderTop: '1px solid #999300',
        borderBottom: '1px solid #999300',
        borderLeft: '4px solid #999300',
        borderRight: '4px solid #999300',
      },
  },
  datePassed3SelectedRow:{
      backgroundColor: '#b6d1d6 !important',
      borderTop: '1px solid #fff600',
      borderBottom: '1px solid #fff600',
      borderLeft: '4px solid #fff600',
      borderRight: '4px solid #fff600',
      '&:hover':{
        backgroundColor: '#b2c1c6 !important',
        borderTop: '1px solid #999300',
        borderBottom: '1px solid #999300',
        borderLeft: '4px solid #999300',
        borderRight: '4px solid #999300',
      },
  },
  datePassed4Row:{
    backgroundColor: '#fff !important',
    borderTop: '1px solid #55c200',
    borderBottom: '1px solid #55c200',
    borderLeft: '4px solid #55c200',
    borderRight: '4px solid #55c200',
    '&:hover':{
      backgroundColor: '#ddd !important',
      borderTop: '1px solid #33a100',
      borderBottom: '1px solid #33a100',
      borderLeft: '4px solid #33a100',
      borderRight: '4px solid #33a100',
    },
},
datePassed4SelectedRow:{
    backgroundColor: '#b6d1d6 !important',
    borderTop: '1px solid #55c200',
    borderBottom: '1px solid #55c200',
    borderLeft: '4px solid #55c200',
    borderRight: '4px solid #55c200',
    '&:hover':{
      backgroundColor: '#b2c1c6 !important',
      borderTop: '1px solid #33a100',
      borderBottom: '1px solid #33a100',
      borderLeft: '4px solid #33a100',
      borderRight: '4px solid #33a100',
    },
},
  swapPopover:{

  },
  swapPopoverPaper:{
      width: '146px',
      borderRadius: '10px',
      backgroundColor: '#6f6f6f',
  },
  task_name_div:{
      
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      flexBasis: '17%',
      '& span':{
          fontWeight: '600',
          color: '#1f2f52',
      },
  },
  task_name_div_head:{
      flexBasis: '17%',
      '& span':{
        fontWeight: '500',
        color: '#fff',
        },
    textAlign: 'center',

  },
  buttonDiv:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '4px',
  },
  openButton:{
      backgroundColor: '#fca437',
      color: '#fff',
      margin: '0px 30px',
      fontWeight: '700',
      fontSize: '13px',
      padding: '0px 16px',
      '&:hover':{
          border: '',
          backgroundColor: '#ffedc4',
          color: '#d87b04'
      }
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
  headListItem:{
    background: '#293a5a',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
    paddingRight: '3% !important',
  },
  listItemDiv:{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '2px 2px'
  },
  listItemInfoDiv:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'start',
      alignItems: 'center',
      //margin: '0px 15px',
      flexBasis: '100%',
      '& span':{
          textAlign: 'center',
      }
  },
  listItemOrderNumDiv:{
      flexBasis: '6%',
      '& span':{
        fontFamily: 'sans-serif',
        padding: '0px 5px'
      }
  },
  listItemText:{
      marginTop: 0,
      marginBottom: 0,
      flexBasis: '95%',
  },
  labelDiv:{
      textAlign: 'center',
  },  
  inputDiv:{
      display:'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      //width: '25%',
      margin: '5px 0px',
      paddingRight:'15px', 
      color: '#a55400'
  },
  completed_job_list_info:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

  },
  crewOptionsContainer:{
    margin: '5px 0px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRangeContainer:{
    flexBasis: '70%',
    display: 'flex',
    flexDirection: 'row',
      justifyContent: 'start',
      alignItems: 'center',
    padding: '8px',
    margin: '4px 6px 2px 6px',
    borderRadius: '4px',
    border: '1px solid #bbb',
    background: '#fff',
  },
  dateRangeCheckbox:{
    flexBasis: '30%'
  },
  dateRangeDiv:{
      flexBasis: '70%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
  },
  dateRangeSpan:{
      fontSize: '13px',
      fontFamily: 'sans-serif',
      fontWeight:'600',
      color: '#666',
      textAlign: 'center'
  },
      inputSpan:{
      marginRight: '10px',
      fontSize: '13px',
      fontFamily: 'sans-serif',
  },
  inputField:{
      '& input':{
          backgroundColor: '#fff',
          padding: '5px 8px',
          width: '80px'
      }
  },
  expansionTitleSpan:{
      fontFamily: 'sans-serif',
      fontSize: '1em',
      color: '#555',
      fontWeight: 600,
  },
  expandedTitleSpanSelected: {
    color: '#3179ff',
    fontWeight: 600,
    fontFamily: 'sans-serif',
    fontSize: '1em',
  },
  expandedSummary:{
    border: '1px solid #9a9a9a',
    background: 'linear-gradient(0deg, #ffffff, #ffffff)',
    boxShadow: '0px 3px 3px 0px #aeaeae',
      '& .MuiAccordionSummary-content':{
          margin: 0,
      },
      minHeight: '20px !important',
      ' & .MuiAccordionSummary-expandIcon':{
        padding: 6,
      }
  },
  expansionDetail:{
      display: 'block',
      backgroundColor: '#ededed',
      padding: '0px 16px 0px'
      //boxShadow: 'inset 0 0 3px 1px #9a9a9a',
  },
  showingDiv:{
    textAlign:'center',
  },
  showingSpan:{
    fontSize: '.8em',
  },
  spanLink:{
      cursor: 'pointer',
      textDecoration: 'underline',
      color: '#2222bb',
      padding: '0px 5px',
      fontSize: '.8em',
  },
  jobPanelIcon:{
    padding: '6px',
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
    checkboxSpan:{
        padding: 0,
    },
    popOverDiv:{
        border: '1px solid #a9a9a9',
        backgroundColor: '#fff',
        '&:hover':{
          boxShadow: '0px 0px 4px 0px black',
          cursor: 'pointer',
          backgroundColor: '#b1b1b159',
        },
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '60px',
    },
    crew_list_item:{
        backgroundColor: '#f9ebca',
        '&:hover':{
            backgroundColor: '#e9c46c',
            color: '#404654',
        },
        padding: '0% 5%',
        border: '1px solid #b2b2b2',
    },
        list_head:{
        lineHeight: '24px',
        borderRadius: '5px',
        color: '#fff',
        backgroundColor: '#61a4a1',
    },
    jobTypeSpan:{
        textTransform: 'uppercase',
    },
    listItemTextPrimary:{
        '& span':{
            display: 'inline-flex',
            justifyContent: 'center',
            '&:hover':{
                textDecoration: 'underline',
                color: '#ececec',
                cursor: 'pointer',
            },
            '& .MuiSvgIcon-root':{
                marginLeft: '1px',
                fontSize: '1.5em',
            }
        },
        fontWeight: '600',
        color: '#ffffff',
     },
    headlistItemText:{
        textAlign: 'center',
        whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
     },
     crewFilterDiv:{
         flexBasis: '30%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '3px',
    },
}));