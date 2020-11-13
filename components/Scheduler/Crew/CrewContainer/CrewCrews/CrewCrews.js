import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Paper, Grid, List, ListItem, ListSubheader, ListItemText, ListItemSecondaryAction, IconButton, Popover, Checkbox, Button,
    Collapse } from '@material-ui/core';

import clsx from 'clsx';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import SwapIcon from '@material-ui/icons/SwapHoriz';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../../UI/ConfirmYesNo';

import { CrewContext } from '../../CrewContextContainer';
import { TaskContext } from '../../../TaskContainer';
import cogoToast from 'cogo-toast';

import Crew from '../../../../../js/Crew';
import CrewMemberActionAdd from '../CrewMemberActionAdd';
import CrewMemberActionEdit from '../CrewMemberActionEdit';


import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CrewCrewsCrews from './CrewCrewsCrews';
import Util from '../../../../../js/Util';


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
    const {setModalTaskId, setModalOpen, setTabValue, filters, setFilters, setFilterInOrOut, setFilterAndOr} = useContext(TaskContext);

    const { crewMembers,setCrewMembers, allCrewJobs, allCrews, setAllCrews,
        setAllCrewJobs, allCrewJobMembers, setAllCrewJobMembers, setShouldResetCrewState} = useContext(CrewContext);
    const classes = useStyles();

    const [selectedCrew, setSelectedCrew] = useState(null);
    const [crewJobs, setCrewJobs] = useState(null);
    const [selectedCrewMembers, setSelectedCrewMembers] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    //Popover
    //Swap Jobs
    const [jobAnchorEl, setJobAnchorEl] = React.useState(null);
    const [swapJobId, setSwapJobId] = useState(null); 
    
    useEffect(()=>{
        if(selectedCrew && crewJobs == null){
            Crew.getCrewJobsByCrew(selectedCrew.id)
            .then((data)=>{
                if(data){
                    console.log("Data",data);
                    setCrewJobs( data);
                }
            })
            .catch((error)=>{
                console.error("Error getting crewJobs", error);
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
    },[selectedCrew])


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

    const handleRemoveCrewJob = (event, id) => {
        if(!id){
            cogoToast.error("Couldnt delete job");
            console.error("Bad/no id on delete");
            return;
        }

        const deleteMember = () => {
            Crew.deleteCrewJob(id)
                .then( (data) => {
                        setCrewJobs(null);
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

    const handleSwapJob = (event, crew) => {
        if(!crew.id || !swapJobId){
            cogoToast.error("Could not swap.");
            console.error("Bad member or swapJobId for swap.");
            return;
        }
        console.log(crew.id);
        console.log(swapJobId);
        Crew.updateCrewJob(crew.id, swapJobId)
        .then((data)=>{
            setCrewJobs(null);
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
        background: isDraggingOver ? "#fff" : "lightgrey",
        padding: grid,
        width: 'auto'
    });

    const onDragEnd = (result) => {
        console.log("RESULT",result)
        if(!selectedCrew){
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
        Crew.reorderCrewJobs(temp,selectedCrew.id)
        .then( (ok) => {
            if(!ok){
                throw new Error("Could not reorder crew" + selectedCrew.id);
            }
            cogoToast.success(`Reordered Crew Jobs`, {hideAfter: 4});
            setCrewJobs(null);
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
            console.log("Bad properttties man");
            return "";
        }));
        console.log("Properties", properties);
        console.log("crew", crew);

        //2 = map
        setTabValue(2);
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


    return(
        <>
        <Grid container className={classes.crew_grid}>
            <Grid item xs={6} >
                <CrewCrewsCrews selectedCrew={selectedCrew} setSelectedCrew={setSelectedCrew} crewJobs={crewJobs} setCrewJobs={setCrewJobs}
                     selectedCrewMembers={selectedCrewMembers} setSelectedCrewMembers={setSelectedCrewMembers} 
                     selectedJob={selectedJob} setSelectedJob={setSelectedJob}/>
                
            </Grid>

            <Grid item xs={5} className={classes.job_root}>
                <div className={classes.job_list_head}>
                <span>Job List - {selectedCrew ? selectedCrew.crew_leader_name ? selectedCrew.crew_leader_name : 'Crew ' + selectedCrew.id : ""}</span>
                </div>
                {selectedCrew ? <>
                <List > 
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
                            {crewJobs && crewJobs.map((row, index) => {
                                const labelId = `checkbox-list-label-${row.id}`;
                                return (
                                <Draggable key={row.id + index+ 'draggable'} draggableId={row.id.toString()} index={index} isDragDisabled={false}>
                                {(provided, snapshot) => { 
                                    const date = row.install_date || row.drill_date || null;
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
                                                    //selectedJob ? (selectedJob.id === row.id ? classes.selectedRow : classes.nonSelectedRow) : classes.nonSelectedRow}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={selectedCrew ? getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style
                                                ) : {}}>
                                    <ListItemText id={labelId}>
                                            <><div className={classes.task_name_div}><span>{row.t_name}</span></div>
                                            <div className={classes.job_list_task_info}> 
                                                    {row.job_type == 'install' ? <><span className={classes.installSpan}>
                                                            INSTALL DATE:</span> <span> {row.install_date ? Util.convertISODateToMySqlDate(row.install_date) : 'Not Assigned'}
                                                        </span></>
                                                     : row.job_type == 'drill' ? <><span className={classes.drillSpan}>
                                                         DRILL DATE: </span> <span>{row.drill_date ? Util.convertISODateToMySqlDate(row.drill_date) : 'Not Assigned'}</span> </>
                                                         : 'BAD TYPE'}
                                                    &nbsp;<span>{datePassed ? "DATE PASSED" : ""}</span>
                                              </div></>
                                    </ListItemText>
                                    <ListItemSecondaryAction className={classes.secondary_div}>
                                            
                                    <IconButton onClick={event => handleOpenSwapPopover(event, row)} >
                                        <SwapIcon edge="end" aria-label="edit" />
                                    </IconButton>
                                            
                                            
                                            <IconButton className={classes.secondary_button} edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.task_id)}>
                                            <EditIcon />
                                            </IconButton>
                                            
                                            <IconButton className={classes.secondary_button} edge="end" aria-label="delete" onClick={event => handleRemoveCrewJob(event, row.id)}>
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
                        <Button className={classes.openButton} onClick={event => handleMapCrewJobs(event, selectedCrew.id, crewJobs)}>Map Crew Jobs</Button>
                        
                        </> : <>Select a crew member to view jobs</> }
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
                                        onMouseUp={(event)=>handleSwapJob(event, crew)}>
                                <ListItemText primary={crew.crew_leader_name ? crew.crew_leader_name : 'Crew ' + crew.id} />
                            </ListItem>
                        ))}
                </List>
            </Popover>
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
        backgroundColor: '#eeeeee',
        borderRadius: '4px',
        boxShadow: '0px 1px 3px 0px #000000db',
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
        '& span':{
            fontWeight: '600',
            color: '#1f2f52',
        },
    },
    job_list_task_info:{
        '& span':{
            fontWeight: '500',
        }
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
    }
    
  }));

