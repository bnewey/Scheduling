import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Paper, Grid, List, ListItem, ListSubheader, ListItemText, ListItemSecondaryAction, IconButton, Popover, Checkbox, Button,
    Collapse, Accordion, AccordionDetails, AccordionSummary, Tooltip} from '@material-ui/core';

import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

import clsx from 'clsx';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SwapIcon from '@material-ui/icons/SwapHoriz';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../../UI/ConfirmYesNo';

import { CrewContext } from '../../CrewContextContainer';
import { TaskContext } from '../../../TaskContainer';
import cogoToast from 'cogo-toast';

import Crew from '../../../../../js/Crew';
import CrewMemberActionAdd from '../CrewMemberActionAdd';
import CrewMemberActionEdit from '../CrewMemberActionEdit';

import moment from 'moment'

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CrewCrewsCrews from './CrewCrewsCrews';
import Util from '../../../../../js/Util';
import Pdf from '../../../../../js/Pdf';

function arraysEqual(_arr1, _arr2) {
    if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
      return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();

    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}


const CrewCrews = (props) => {

    const {} = props;
    const {setModalTaskId, setModalOpen, setTabValue, filters, setFilters, setFilterInOrOut, setFilterAndOr, crewToMap, setCrewToMap} = useContext(TaskContext);

    const { crewMembers,setCrewMembers, allCrewJobs, allCrews, setAllCrews,
        setAllCrewJobs, allCrewJobMembers, setAllCrewJobMembers, setShouldResetCrewState,
        crewJobs, setCrewJobs, crewJobDateRange, setCrewJobDateRange } = useContext(CrewContext);
    const classes = useStyles();

    const [selectedCrew, setSelectedCrew] = useState(null);
    const [localCrewJobs, setLocalCrewJobs] = useState(null);
    const [selectedCrewMembers, setSelectedCrewMembers] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [expanded, setExpanded] = useState('activeJobPanel');

    const [unfilteredJobs, setUnfilteredJobs] = useState(null);
    //Popover
    //Swap Jobs
    const [jobAnchorEl, setJobAnchorEl] = React.useState(null);
    const [swapJobId, setSwapJobId] = useState(null); 

    const [listHeight, setListHeight] = React.useState(370)

    useEffect(()=>{
        if(selectedCrew && localCrewJobs == null){
            Crew.getCrewJobsByCrew(selectedCrew.id)
            .then((data)=>{
                if(data){
                    //filter using to and from dates
                    var updateData = data.filter((j)=>j.completed == 0)
                    if(crewJobDateRange){
                        updateData = updateData.filter((job,i)=>{
                            var date;
                            if(job.job_type == "install"){
                                date = Util.convertISODateToMySqlDate(job.sch_install_date) || null;
                            }
                            if(job.job_type == "drill"){
                                date = Util.convertISODateToMySqlDate(job.drill_date) || null;
                            }

                            if(date != null){
                                return moment(date).isAfter( moment(Util.convertISODateToMySqlDate(crewJobDateRange.from)).subtract(1, 'days')) && moment(date).isBefore( moment(Util.convertISODateToMySqlDate(crewJobDateRange.to)).add(1,'days'))
                            }else{
                                //Date not assigned
                                return true
                            }
                        })
                    }
                    setUnfilteredJobs([...data]);
                    setLocalCrewJobs( updateData);
                }
            })
            .catch((error)=>{
                console.error("Error getting localCrewJobs", error);
                cogoToast.error("Failed to get crew jobs");
            })
        }

        if(selectedCrew && selectedCrewMembers ==null){
            Crew.getCrewMembersByCrew(selectedCrew.id)
            .then((data)=>{
                if(Array.isArray(data)){
                    setSelectedCrewMembers(data.sort((a,b)=> (a.is_leader > b.is_leader) ? -1 : 1 ));

                }

            })
            .catch((error)=>{
                if(error){
                    cogoToast.error("Internal server error");
                    console.log("Failed to get crew members", error);
                }
            })
        }
    },[selectedCrew, localCrewJobs])


    const handleSelectJob =(event,job)=>{
        if(!job){
            console.error("Couldn't Select job");
            cogoToast.error("Error selecting job", {hideAfter: 4})
        }
        setSelectedJob(job);
    }

    const handleDeleteMember = (event, memberId) => {
        if(!memberId){
            cogoToast.error("Couldnt delete member");
            console.error("Bad/no memberId on delete");
            return;
        }

        const deleteMember = () => {
            Crew.deleteCrewMember(memberId)
                .then( (data) => {
                        setCrewMembers(null);
                        cogoToast.success(`Removed member ${memberId} from crew members`, {hideAfter: 4});
                    })
                .catch( error => {
                console.warn("Error removing member",error);
                cogoToast.error(`Error removing Task from Crew members`, {hideAfter: 4});
                 });
          }
          confirmAlert({
              customUI: ({onClose}) => {
                  return(
                      <ConfirmYesNo onYes={deleteMember} onClose={onClose} customMessage={"Remove member from crew members?"}/>
                  );
              }
          })
    }

    const handleRightClick = (event, id) => {
        setModalTaskId(id);
        setModalOpen(true);

        //Disable Default context menu
        event.preventDefault();
    };

    const handleRemoveCrewJob = (event, id, crew_id) => {
        if(!id){
            cogoToast.error("Couldnt delete job");
            console.error("Bad/no id on delete");
            return;
        }

        const deleteMember = () => {
            Crew.deleteCrewJob(id, crew_id)
                .then( (data) => {
                        setLocalCrewJobs(null);
                        cogoToast.success(`Removed job ${id} from crew jobs`, {hideAfter: 4});
                    })
                .catch( error => {
                console.warn("Error removing job",error);
                cogoToast.error(`Error removing job from Crew jobs`, {hideAfter: 4});
                 });
          }
          confirmAlert({
              customUI: ({onClose}) => {
                  return(
                      <ConfirmYesNo onYes={deleteMember} onClose={onClose} customMessage={"Remove job from this members jobs?"}/>
                  );
              }
          })
    };

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
        
        Crew.updateCrewJob(crew.id, swapJobId, old_crew_id)
        .then((data)=>{
            setLocalCrewJobs(null);
            setShouldResetCrewState(true);
            setSelectedCrew({...selectedCrew});
        })
        .catch((error)=>{
            console.error(error);
            cogoToast.error("Failed to swap jobs");
        });
        if(jobPopoverOpen){
            handleJobPopoverClose();
        }
    }


    //// DRAG N DROP
    // a little function to help us with reordering the result
    const reorder = (list, startIndex, endIndex) => {
        if(!selectedCrew){
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
        padding: '3px',
        margin: `0 0 1px 0`,

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
        if(!selectedCrew){
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
    
        const items = reorder(
        localCrewJobs,
        result.source.index,
        result.destination.index
        );
        console.log("Items", items);

        var temp = items.map((item, i)=> item.id);
        if(!temp){
            console.error("Failed to reorder, bad temp list to update")
            return;
        }
       

        Crew.reorderCrewJobs(temp,selectedCrew.id)
        .then( (ok) => {
            if(!ok){
                throw new Error("Could not reorder crew" + selectedCrew.id);
            }
            cogoToast.success(`Reordered Crew Jobs`, {hideAfter: 4});
            setLocalCrewJobs(null);
            setSelectedCrew({...selectedCrew});
        })
        .catch( error => {
            console.error(error);
            cogoToast.warn(`Could not reorder crew jobs`, {hideAfter: 4});
        });
            
    }
    // END DND

    const handleMapCrewJobs = (event, crew, jobs) => {
        if(!crew){
            cogoToast.error("Failed to Map crew jobs");
            console.log("Bad crew in handleMapCrewJobs");
            return;
        }      
        if(!selectedCrew){
            console.error("No selected crew in handleMapCrewJobs")
            return;
        }

        //2 = map
        setTabValue(2);
      
        //setCrewJobs(localCrewJobs);
        setCrewToMap(selectedCrew);
    }

    const handleFilterCrewJobs = (event, crew, jobs) => {
        if(!crew){
            cogoToast.error("Failed to Map crew jobs");
            console.log("Bad crew in handleFilterCrewJobs");
            return;
        }
        if(!filters){
            console.error("Filters is null");
            return;
        }

        //Check jobs for install and/or drill
        let properties = new Set([...jobs].map((v,i)=>{
            if(v.job_type == "drill"){
                return "drill_crew"
            }
            if(v.job_type == "install"){
                return "install_crew"
            }
            return "";
        }));

        //1 = tasklist
        setTabValue(1);
        let newFilters = [];

        properties.forEach((item,i)=>{
            newFilters.push({
                property: item, 
                value: crew.toString(),
            })
        })
        
        setFilters(newFilters);
        setFilterInOrOut("in");
        setFilterAndOr("or");

    }

    const handleUpdateJobCompleted =(event, job_id, crew_id)=>{
        var completed = event.target.checked ? 1 : 0;

        Crew.updateCrewJobCompleted(completed, job_id, crew_id )
        .then((data)=>{
            
            setLocalCrewJobs(null);
            setSelectedCrew({...selectedCrew});
            cogoToast.success("Successfully update crew job");

        })
        .catch((error)=>{
            console.error("Failed to update completed of crew job");
            cogoToast.error("Failed to update crew job");
        })
    }

    const handleOpenCrewPDF = (event, crew, jobs)=>{

        if(jobs && Array.isArray(jobs)){

            Pdf.createCrewJobPdf(crew, jobs)
            .then((data)=>{
            var fileURL = URL.createObjectURL(data);
            window.open(fileURL);
            })
            .catch((error)=>{
            console.error("Failed to create and open pdf", error);
            })
        }    

        if(event){
            event.stopPropagation();
        }

    }

    const changeDateRange = (to, from) =>{
        setCrewJobDateRange({
          to: to ? new Date(to) : crewJobDateRange.to,
          from: from ? new Date(from) : crewJobDateRange.from
        })
        setLocalCrewJobs(null);
    }

    const handleChangePanel = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
      };

    const handleShowAllDates = (event)=>{
        if(!selectedCrew || !unfilteredJobs || !crewJobDateRange){
            console.error("Bad crew or jobs or dates in handleShowAllDates");
            return;
        }
        var minDate = moment() ;
        var maxDate = moment() ;

        //Get min and max dates for our jobs
        unfilteredJobs.filter((j)=> j.completed == 0).forEach((job)=>{
            var date;
            if(job.job_type == "install"){
                date = Util.convertISODateToMySqlDate(job.sch_install_date) || null;
            }
            if(job.job_type == "drill"){
                date = Util.convertISODateToMySqlDate(job.drill_date) || null;
            }

            if(moment(Util.convertISODateToMySqlDate(minDate)).isAfter( date )){
                minDate = date;
            }
            if(moment(Util.convertISODateToMySqlDate(maxDate)).isBefore(date)){
                maxDate = date;
            }

        });
        
        setCrewJobDateRange({
            to: moment(maxDate).format(),
            from: moment(minDate).format()
        })
        setLocalCrewJobs(null);

    }

    const getShowingSpan = () =>{
        if(!localCrewJobs){
            return "";
        }
        var jobList = [...localCrewJobs];
        var allJobList = unfilteredJobs?.filter((j)=>j.completed ==0);
        if(!jobList || !allJobList){
            return ""
        }
        if(jobList?.length == allJobList.length){
            return ("");
        }
        return(
            <><span>Showing {jobList.length || ""} of {allJobList.length} Active Jobs</span>
                        <span className={classes.spanLink} onClick={event=> handleShowAllDates(event)}>(Show All)</span></>)
    }

    // const handleToggleExpandList = () =>{
    //     if(listHeight === 370){
    //         setListHeight(600);
    //     }else{
    //         setListHeight(370);
    //     }
    // }

    return(
        <>
        <Grid container className={classes.crew_grid}>
            <Grid item xs={4} >
                <CrewCrewsCrews selectedCrew={selectedCrew} setSelectedCrew={setSelectedCrew} localCrewJobs={localCrewJobs} setLocalCrewJobs={setLocalCrewJobs}
                     selectedCrewMembers={selectedCrewMembers} setSelectedCrewMembers={setSelectedCrewMembers} 
                     selectedJob={selectedJob} setSelectedJob={setSelectedJob}/>
                
            </Grid>

            <Grid item xs={7} className={classes.job_root}>
                <div className={classes.job_list_head}>
                <span>Job List - {selectedCrew ? selectedCrew.crew_leader_name ? selectedCrew.crew_leader_name : 'Crew ' + selectedCrew.id : ""}</span>
                </div>
                {selectedCrew ? <>
                <Accordion expanded={expanded === 'activeJobPanel'} onChange={handleChangePanel('activeJobPanel')}>
                <AccordionSummary
                className={classes.expandedSummary}
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                ><div><span className={classes.expansionTitleSpan}>Active Jobs</span></div>
                {expanded === 'activeJobPanel' && <div className={classes.buttonDiv}>
                <Button className={classes.openButton} onClick={event => handleMapCrewJobs(event, selectedCrew.id, localCrewJobs)}>Map Jobs</Button>
                <Button className={classes.openButton} onClick={event => handleFilterCrewJobs(event, selectedCrew.id, localCrewJobs)}>Filter in TaskList</Button>
                <Button className={classes.openButton} onClick={event => handleOpenCrewPDF(event, selectedCrew, localCrewJobs)}>PDF</Button>
                </div>}
                </AccordionSummary>
                <AccordionDetails
                className={classes.expansionDetail}><>
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
                    </div>
                <div>{ getShowingSpan() }
                        
                    </div>
                <List style={{maxHeight: `${listHeight}px`}} className={classes.jobList}> 
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable"
                            renderClone={(provided, snapshot, rubric) => (
                            <div
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                            >
                                <ListItem key={localCrewJobs[rubric.source.index].id} 
                                                role={undefined} dense button 
                                                className={classes.nonSelectedRow}
                                                >
                                    <ListItemText>
                                            {localCrewJobs[rubric.source.index].id} | {localCrewJobs[rubric.source.index].t_name} 
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
                            {localCrewJobs && localCrewJobs.map((row, index) => {
                                const labelId = `checkbox-list-label-${row.id}`;
                                return (
                                <Draggable key={row.id + index+ 'draggable'} draggableId={row.id.toString()} index={index} isDragDisabled={false}>
                                {(provided, snapshot) => { 
                                    const date = row.job_type == "install" ? row.sch_install_date  : (row.job_type =="drill" ? row.drill_date : null);
                                    const datePassed = date && (new Date(date) < new Date());
                                    const selected = selectedJob?.id === row.id;
                                    return (
                                    <ListItem key={row.id + index} 
                                                role={undefined} dense button 
                                                onClick={event => handleSelectJob(event, row)}
                                                onContextMenu={event => handleRightClick(event, row.task_id)}
                                                selected={selectedJob && selectedJob.id === row.id}
                                                className={ clsx( {[classes.selectedRow]: selected },
                                                    {[classes.nonSelectedRow]: !selected},
                                                    {[classes.datePassedRow]: !selected && datePassed },
                                                    {[classes.datePassedSelectedRow]: selected && datePassed }
                                                )}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={selectedCrew ? getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style
                                                ) : {}}>
                                        <ListItemText id={labelId} className={classes.listItemText}>
                                                <div className={classes.listItemDiv}>
                                                <div><span className={classes.listItemOrderNum}>{row.ordernum}</span></div>
                                                <div className={classes.listItemInfoDiv}>
                                                    <div className={classes.task_name_div}><span>{row.t_name}</span></div>
                                                    <div className={classes.job_list_task_info}> 
                                                            {row.job_type == 'install' ? <><span className={classes.installSpan}>
                                                                    INSTALL DATE:</span> <span> {date ? Util.convertISODateToMySqlDate(date) : 'Not Assigned'}
                                                                </span></>
                                                            : row.job_type == 'drill' ? <><span className={classes.drillSpan}>
                                                                DRILL DATE: </span> <span>{date ? Util.convertISODateToMySqlDate(date) : 'Not Assigned'}</span> </>
                                                                : 'BAD TYPE'}
                                                            &nbsp;<span>{datePassed ? "DATE PASSED" : ""}</span>
                                                    </div>
                                                    </div>
                                                </div>
                                        </ListItemText>
                                        <ListItemSecondaryAction className={classes.secondary_div}>
                                            <Tooltip title="Mark as Completed" >
                                            <Checkbox
                                                icon={<CheckBoxOutlineBlankIcon fontSize="medium" className={classes.icon} />}
                                                checkedIcon={<CheckBoxIcon fontSize="medium" className={classes.iconChecked} />}
                                                name="checkedI"
                                                checked={row.completed}
                                                onChange={(event)=> handleUpdateJobCompleted(event, row.id, row.crew_id)}
                                            /></Tooltip>

                                            <IconButton onClick={event => handleOpenSwapPopover(event, row)} >
                                                <SwapIcon edge="end" aria-label="edit" />
                                            </IconButton>
                                                
                                                
                                            <IconButton className={classes.secondary_button} edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.task_id)}>
                                            <EditIcon />
                                            </IconButton>
                                            
                                            <IconButton className={classes.secondary_button} edge="end" aria-label="delete" onClick={event => handleRemoveCrewJob(event, row.id, row.crew_id)}>
                                                <DeleteIcon />
                                            </IconButton> 
                                            
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    )}}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                    </DragDropContext>
                        </List> 
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
                <List subheader={
                        <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                            Swap Crews
                        </ListSubheader>}
                    >
                    {selectedCrew && allCrews && allCrews.filter((fil_mem, i)=>{
                                return(fil_mem.id != selectedCrew.id)
                            }).map((crew, i)=>(
                            <ListItem className={classes.member_list_item} 
                                        key={`crew_members+${i}`} button
                                        onMouseUp={(event)=>handleSwapJob(event, crew, selectedCrew.id)}>
                                <ListItemText primary={crew.crew_leader_name ? crew.crew_leader_name : 'Crew ' + crew.id} />
                            </ListItem>
                        ))}
                </List>
            </Popover></>
            </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'completedPanel'} onChange={handleChangePanel('completedPanel')}>
                <AccordionSummary
                className={classes.expandedSummary}
                expandIcon={<ExpandMoreIcon />}
                aria-controls="completedPanel-content"
                id="completedPanel-header"
                >
                <span className={classes.expansionTitleSpan}>Completed Jobs</span>
                </AccordionSummary>
                <AccordionDetails
                    className={classes.expansionDetail}>
                    <List className={classes.completedList}> 
                    {unfilteredJobs && unfilteredJobs.filter((j)=> j.completed == 1).map((row, index) => {
                                const labelId = `checkbox-list-label-${row.id}`;
                                const date = row.job_type == "install" ? row.sch_install_date  : (row.job_type =="drill" ? row.drill_date : null);
                                
                                const datePassed = date && (new Date(date) < new Date());
                                const selected = selectedJob?.id === row.id;
                                return (
                                <ListItem key={row.id + index} 
                                            role={undefined} dense button 
                                            onClick={event => handleSelectJob(event, row)}
                                            onContextMenu={event => handleRightClick(event, row.task_id)}
                                            selected={selectedJob && selectedJob.id === row.id}
                                            className={ clsx( {[classes.selectedRow]: selected },
                                                {[classes.nonSelectedRow]: !selected},
                                                {[classes.datePassedRow]: !selected && datePassed },
                                                {[classes.datePassedSelectedRow]: selected && datePassed }
                                            )}
                                            >
                                    <ListItemText id={labelId} className={classes.listItemText}>
                                                <div className={classes.listItemDiv}>
                                                <div className={classes.listItemInfoDiv}>
                                                    <div className={classes.task_name_div}><span>{row.t_name}</span></div>
                                                    <div className={classes.job_list_task_info}> 
                                                            {row.job_type == 'install' ? <><span className={classes.installSpan}>
                                                                    INSTALL DATE:</span> <span> {date ? Util.convertISODateToMySqlDate(date) : 'Not Assigned'}
                                                                </span></>
                                                            : row.job_type == 'drill' ? <><span className={classes.drillSpan}>
                                                                DRILL DATE: </span> <span>{date ? Util.convertISODateToMySqlDate(date) : 'Not Assigned'}</span> </>
                                                                : 'BAD TYPE'}
                                                            &nbsp;<span>{datePassed ? "DATE PASSED" : ""}</span>
                                                    </div>
                                                    </div>
                                                </div>
                                        </ListItemText>
                                    <ListItemSecondaryAction className={classes.secondary_div}>
                                            
                                        <Checkbox
                                            icon={<CheckBoxOutlineBlankIcon fontSize="medium" className={classes.icon} />}
                                            checkedIcon={<CheckBoxIcon fontSize="medium" className={classes.iconChecked} />}
                                            name="checkedI"
                                            checked={row.completed}
                                            onChange={(event)=> handleUpdateJobCompleted(event, row.id, row.crew_id)}
                                        />

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
                                </List>   
                </AccordionDetails>
            </Accordion>
            </> : <>Select a crew member to view jobs</> }
            </Grid>


        </Grid>

        </>
    );
};

export default CrewCrews;


const useStyles = makeStyles(theme => ({
    root:{

    },
    crew_grid: {
        justifyContent: 'space-around',
    },
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
        border: '1px solid #b2b2b2'
    },
    member_select_list_item:{
        backgroundColor: '#ffa93e',
        '&:hover':{
            backgroundColor: '#e18a1e',
            color: '#404654',
        },
        padding: '0% 5%',
        border: '1px solid #b2b2b2'
    },
    secondary_div:{
        display: 'flex',
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
        background: 'lightgrey',
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
        flexBasis: '60%',
        '& span':{
            fontWeight: '600',
            color: '#1f2f52',
        },
    },
    job_list_task_info:{
        flexBasis: '40%',
        '& span':{
            fontWeight: '500',
        }
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
    installSpan:{
        color: '#e25e00',
    },
    drillSpan:{
        color: '#216fac',
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
        margin: '0px 15px',
        flexBasis: '76%',
    },
    listItemOrderNum:{
        fontFamily: 'sans-serif',
        padding: '0px 5px'
    },
    listItemText:{
        marginTop: 0,
        marginBottom: 0,
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
    dateRangeDiv:{
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
        fontSize: '1.4em',
        color: '#555',
    },
    expandedSummary:{
        background: 'linear-gradient(0deg, #efefef, white)',
        boxShadow: '0px 3px 3px 0px #cecece',
        border: '1px solid #b2b2b2',
        '& .MuiAccordionSummary-content.Mui-expanded':{
            margin: 0,
        },
        minHeight: '40px !important',
    },
    expansionDetail:{
        display: 'block',
        backgroundColor: '#ededed',
        //boxShadow: 'inset 0 0 3px 1px #9a9a9a',
    },
    spanLink:{
        cursor: 'pointer',
        textDecoration: 'underline',
        color: '#2222bb',
        padding: '0px 5px',
    },
    
  }));

