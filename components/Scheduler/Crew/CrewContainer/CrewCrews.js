import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Paper, Grid, List, ListItem, ListSubheader, ListItemText, ListItemSecondaryAction, IconButton, Popover, Checkbox } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import SwapIcon from '@material-ui/icons/SwapHoriz';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

import { CrewContext } from '../../Crew/CrewContextContainer';
import { TaskContext } from '../../TaskContainer';
import cogoToast from 'cogo-toast';

import Crew from '../../../../js/Crew';
import CrewMemberActionAdd from './CrewMemberActionAdd';
import CrewMemberActionEdit from './CrewMemberActionEdit';


import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { check } from 'express-validator/check';


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
    const {setModalTaskId, setModalOpen} = useContext(TaskContext);
    const { crewMembers,setCrewMembers, allCrewJobs,
    setAllCrewJobs} = useContext(CrewContext);
    const classes = useStyles();

    const [crews, setCrews] = useState(null);
    const [selectedCrew, setSelectedCrew] = useState(null);
    const [crewJobs, setCrewJobs] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    //Popover
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [swapJobId, setSwapJobId] = useState(null); 

    //Crews
    useEffect(()=>{
        if(crews == null && allCrewJobs){
            //First get crews by checking against task_id
            var alreadyProcessedJobs = [];
            var tmpCrews = allCrewJobs.map((job,i)=>{
                //Check for already processed tasks with specific job type to be able to skip
                var similarJobs = alreadyProcessedJobs.filter((item, i )=>(    _.isEqual(_.pick(job, ['task_id','job_type']), item)    ))
                if(similarJobs && similarJobs.length > 0){
                    return {ids: []};
                }

                var tmpObject = {names: [], job_count: 0, ids: [], task_id: null, job_type: null};
                
                allCrewJobs.forEach((checkJob, cI)=>{
                    

                    //Check for already processed tasks with specific job type
                    var results = alreadyProcessedJobs.filter((item, i )=>{    var tmp = _.isEqual(_.pick(checkJob, ['task_id','job_type']), item);  return tmp;   })
                    if(results && results.length > 0){
                        return;
                    }
                    //Check Matching jobs for multiple names
                    if(_.isEqual(_.pick(checkJob, ['task_id','job_type']), _.pick(job, ['task_id','job_type']))){
                        tmpObject['names'].push( checkJob.member_name );
                        tmpObject['ids'].push(checkJob.m_id);
                    }else{
                        return;
                    }
                })
                alreadyProcessedJobs.push({task_id: job.task_id, job_type: job.job_type});
                tmpObject['task_id'] = job.task_id;
                tmpObject['job_type'] = job.job_type;
                return tmpObject;
            });
            console.log("tmpCrews", tmpCrews);
            //Filter out empty arrays
            tmpCrews = tmpCrews.filter((crew)=>crew['ids'].length > 0);

            //Filter out duplicates and add to their count
            var alreadyCheckedDups = [];
            var newTmpCrews = tmpCrews.filter((v,i)=>{
                //check already checked dups
                var alreadyChecked = alreadyCheckedDups.filter((item, i )=>(    _.isEqual(_.pick(v, ['ids','job_type']), item)    ))
                if(alreadyChecked && alreadyChecked.length > 0){
                    return false;
                }
                //Check dup
                var anotherTmpVar = tmpCrews.filter((m, iM)=>{
                    if(_.isEqual(_.pick(v, ['ids','job_type']), _.pick(m, ['ids','job_type']),)){
                        v['task_extra_ids'] = v['task_extra_ids'] ? [...v['task_extra_ids'], m.task_id] : [m.task_id];
                        return true;
                    }
                })
                alreadyCheckedDups.push({ids: v.ids, job_type: v.job_type})

                //Return with job count
                if(anotherTmpVar && anotherTmpVar.length > 0){
                    v.job_count = anotherTmpVar.length;
                    return true;
                }
                
            });

            console.log("newtmpcrews",newTmpCrews);
            setCrews(newTmpCrews);
        }
    },[crews])
    
    //Crew Jobs
    // runs when a crew is selected to get its jobs
    useEffect(()=>{
        if(selectedCrew && selectedCrew.task_extra_ids && selectedCrew.task_extra_ids.length > 0 && crewJobs == null ){
            Crew.getCrewJobsByTaskIds(selectedCrew.task_extra_ids, selectedCrew.job_type)
            .then((data)=>{
                if(data){
                    //remove multiples
                    setCrewJobs(data);
                    cogoToast.success("Got member jobs", {hideAfter:2});
                }
            })
            .catch((error)=>{
                console.error("Bad reponse from server on getCrewJobsByTaskIds", error);
                cogoToast.error("Bad reponse from server on getCrewJobsByTaskIds", {hideAfter: 4})
            })
        }
    },[selectedCrew, crewJobs])

    const handleSelectCrew =(event,crew)=>{
        if(!crew){
            console.error("Couldn't Select crew");
            cogoToast.error("Error selecting crew", {hideAfter: 4})
        }
        setCrewJobs(null);
        setSelectedCrew(crew);
    }

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

    //Swap Popover
    const handleOpenSwapPopover = (event, job) =>{
        setAnchorEl(event.currentTarget);
        setSwapJobId(job.id);
    }
    const handlePopoverClose = () => {
        setAnchorEl(null);
        setSwapJobId(null);
    };

    const popoverOpen = Boolean(anchorEl);
    const popoverId = open ? 'swap-popover' : undefined;

    const handleSwapJob = (event, member) => {
        if(!member.id || !swapJobId){
            cogoToast.error("Could not swap.");
            console.error("Bad member or swapJobId for swap.");
            return;
        }
        Crew.updateCrewJob(member.id, swapJobId)
        .then((data)=>{
            setCrewJobs(null);
            
        })
        .catch((error)=>{
            console.error(error);
            cogoToast.error("Failed to swap jobs");
        });
        if(popoverOpen){
            handlePopoverClose();
        }
    }

    //end of swap popover

    //// DRAG N DROP

            // a little function to help us with reordering the result
            const reorder = (list, startIndex, endIndex) => {
                if(!selectedCrew){
                cogoToast.info(`No member to reorder`, {hideAfter: 4});
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
                background: isDraggingOver ? "lightblue" : "lightgrey",
                padding: grid,
                width: 'auto'
            });
        
            const onDragEnd = (result) => {
                console.log("RESULT",result)
                // if(!taskListToMap){
                // return;
                // }
                // // dropped outside the list
                // if (!result.destination) {
                // return;
                // }
            
                // const items = reorder(
                // markedRows,
                // result.source.index,
                // result.destination.index
                // );
                
                // var temp = items.map((item, i)=> item.t_id);
                // TaskLists.reorderTaskList(temp,taskListToMap.id)
                // .then( (ok) => {
                //         if(!ok){
                //             throw new Error("Could not reorder tasklist" + taskListToMap.id);
                //         }
                //         cogoToast.success(`Reordered Task List`, {hideAfter: 4});
                //         //refresh tasklist
                //         setReFetchTaskList(true);
                //     })
                // .catch( error => {
                //     console.error(error);
                //     cogoToast.warn(`Could not reorder task list`, {hideAfter: 4});
                //     });
                    
            }
      // END DND



    return(
        <>
        <Grid container>
            <Grid item xs={3} >
                <List 
                    className={classes.memberList}
                    subheader={
                        <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                            Crews
                        </ListSubheader>
                    }>
                    {crews && crews.map((crew, i)=>{
                        return(
                        <ListItem className={selectedCrew == crew ? classes.member_select_list_item : classes.member_list_item} 
                                    key={`crews+${i}`} button
                                    onMouseUp={(event)=>handleSelectCrew(event, crew)}>
                            <ListItemText>
                            
                        {crew.names.map((name,i)=> ( <span key={name + i}>{name}{ (crew.names.length != i+1) ? <>,&nbsp;</> : <></> }</span>))}
                        <span>&nbsp;({crew.job_count})</span> <span className={classes.job_type_span}>{crew.job_type}</span>
                            </ListItemText>
                            <ListItemSecondaryAction>            
                              <React.Fragment>
                                {/* <CrewMemberActionEdit initialMember={crew}/> */}
                                {/* <IconButton className={classes.secondary_button} edge="end" aria-label="delete" onClick={event => handleDeleteMember(event, member.id)}>
                                  <DeleteIcon />
                                </IconButton>  */}
                              </React.Fragment>
                                &nbsp;&nbsp;&nbsp;
                            </ListItemSecondaryAction>
                        </ListItem>
                    )})}
                    <ListItem className={classes.text_button_li}>
                        <div className={classes.singleLineDiv}>
                            {/* <CrewMemberActionAdd /> */}
                         </div>
                    </ListItem>
                </List>
                
            </Grid>

            <Grid item xs={7} className={classes.job_root}>
                <div className={classes.job_list_head}>
                    <span>Job List - </span>
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
                                {(provided, snapshot) => (
                                    <ListItem key={row.id + index} 
                                                role={undefined} dense button 
                                                onClick={event => handleSelectJob(event, row)}
                                                onContextMenu={event => handleRightClick(event, row.task_id)}
                                                selected={selectedJob && selectedJob.id === row.id}
                                                className={selectedJob ? (selectedJob.id === row.id ? classes.selectedRow : classes.nonSelectedRow) : classes.nonSelectedRow}
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
                                                    {row.job_type == 'install' ? <span>INSTALL DATE: {row.install_date ? row.install_date : 'Not Assigned'}</span>
                                                     : row.job_type == 'drill' ? <span>DRILL DATE: {row.drill_date ? row.install_date : 'Not Assigned'}</span> : 'BAD TYPE'}
                                                    
                                              </div></>
                                    </ListItemText>
                                    <ListItemSecondaryAction>
                                            <React.Fragment>
                                                <IconButton onClick={event => handleOpenSwapPopover(event, row)} >
                                                    <SwapIcon edge="end" aria-label="edit" />
                                                </IconButton>
                                            </React.Fragment>
                                            <React.Fragment>
                                            <IconButton edge="end" aria-label="edit" onClick={event => handleRightClick(event, row.task_id)}>
                                            <EditIcon />
                                            </IconButton>
                                            
                                            <IconButton edge="end" aria-label="delete" onClick={event => handleRemoveCrewJob(event, row.id)}>
                                                <DeleteIcon />
                                            </IconButton> 
                                            
                                            </React.Fragment>
                                        
                                        &nbsp;&nbsp;&nbsp;
                                    </ListItemSecondaryAction>
                                    </ListItem>
                                    )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                    </DragDropContext>
                        </List> </> : <>Select a crew member to view jobs</> }
            <Popover
                id={popoverId}
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
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
                <List >
                    {selectedCrew && crewMembers && crewMembers.filter((fil_mem, i)=>{return(fil_mem.id != selectedCrew.id)}).map((member, i)=>(
                            <ListItem className={classes.member_list_item} 
                                        key={`crew_members+${i}`} button
                                        onMouseUp={(event)=>handleSwapJob(event, member)}>
                                <ListItemText primary={member.member_name} />
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
    list_head:{
        lineHeight: '24px',
        borderRadius: '5px',
    },
    memberList:{
        width: '100%',
        backgroundColor: '#dedede',
        borderRadius: '5px',
        maxHeight: '500px',
        overflowY: 'auto',
        boxShadow: '0px 1px 3px 0px #000000db',
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
        padding: '2% 8%',
        border: '1px solid #b2b2b2'
    },
    member_select_list_item:{
        backgroundColor: '#ffa93e',
        '&:hover':{
            backgroundColor: '#e18a1e',
            color: '#404654',
        },
        padding: '2% 8%',
        border: '1px solid #b2b2b2'
    },
    secondary_button:{
        padding: '6px',
        marginRight: '2px',
    },
    job_list_head:{
        backgroundColor: '#324773',
        color: '#fff',
        fontSize: '1.4em',
        fontWeight: '600',
    },
    job_root: {
        margin: '0% 5%',
        color: '#535353',
        padding: '1%',
        backgroundColor: '#eeeeee',
        borderRadius: '4px',
        boxShadow: '0px 1px 3px 0px #000000db',
    },
    items:{
        color: '#fcfcfc'
    },
    selectedRow:{
        border: '1px solid #fbff08',
        backgroundColor: '#b6cee3 !important',
        '&:hover':{
            backgroundColor: '#92bfe5 !important',
            border: '1px solid #ececec',
        },
        boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
    },
    nonSelectedRow:{
        border: '1px solid #91979c',
        backgroundColor: '#dcf6ff !important',
        '&:hover':{
          backgroundColor: '#fff !important',
          border: '1px solid #ececec',
        },
        boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.46)'
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
    job_type_span:{
        textTransform: 'uppercase',
        fontSize: '.7em',
        color: '#002362',
        fontWeight: '600',
    }
    
  }));

