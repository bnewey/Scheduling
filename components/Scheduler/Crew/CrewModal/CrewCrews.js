import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Paper, Grid, List, ListItem, ListSubheader, ListItemText, ListItemSecondaryAction, IconButton, Popover } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import SwapIcon from '@material-ui/icons/SwapHoriz';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

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

    const {crewMembers, setCrewMembers, allCrewJobs, setAllCrewJobs} = props;
    const {setModalTaskId, setModalOpen} = useContext(TaskContext);
    const classes = useStyles();

    const [crews, setCrews] = useState(null);
    const [selectedCrew, setSelectedCrew] = useState(null);
    const [crewJobs, setMemberJobs] = useState(null);
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
                var apjFlag = false;
                    //Check for already processed tasks with specific job type
                    alreadyProcessedJobs.forEach((item, i)=>{
                        if(item.task_id == job.task_id && item.job_type == job.job_type){
                            apjFlag = true;
                        }
                    })
                if(apjFlag){    console.log("skipping..."); return {ids: []};      }

                var tmpObject = {names: [], job_count: 0, ids: [], task_id: null, job_type: null};
                
                allCrewJobs.forEach((checkJob, cI)=>{
                    console.log("alreadyprocessedjobs", alreadyProcessedJobs);
                    var apjFlag = false;
                    //Check for already processed tasks with specific job type
                    alreadyProcessedJobs.forEach((item, i)=>{
                        if(item.task_id == checkJob.task_id && item.job_type == checkJob.job_type){
                            apjFlag = true;
                        }
                    })
                    if(apjFlag){    console.log("skipping..."); return;      }

                    if(job.task_id == checkJob.task_id && job.job_type == checkJob.job_type){
                        console.log("job type",job.job_type);
                        console.log("checkjob type: ", checkJob.job_type);
                        tmpObject['names'].push( checkJob.member_name );
                        tmpObject['ids'].push(checkJob.m_id);
                    }else{
                        return;
                    }
                })
                alreadyProcessedJobs.push({task_id: job.task_id, job_type: job.job_type});
                tmpObject['task_id'] = job.task_id;
                tmpObject['job_type'] = job.job_type;
                return tmpObject
            });
            console.log("tmpCrews", tmpCrews);
            //Filter out empty arrays
            tmpCrews = tmpCrews.filter((crew)=>crew['ids'].length > 0);
            //Filter out duplicates
            var newTmpCrews = tmpCrews.filter((v,i)=>tmpCrews.indexOf(v)===i);

            console.log("newtmpcrews",newTmpCrews);
            setCrews(newTmpCrews);
        }
    },[crews])
    //Crew Jobs
    // useEffect(()=>{
    //     if(selectedCrew && crewJobs == null ){
    //         Crew.getCrewJobsByCrew(selectedCrew.id)
    //         .then((data)=>{
    //             if(data){
    //                 setMemberJobs(data);
    //                 cogoToast.success("Got member jobs", {hideAfter:2});
    //             }
    //         })
    //         .catch((error)=>{
    //             console.error("Bad reponse from server on getCrewJobsByMember", error);
    //             cogoToast.error("Bad reponse from server on getCrewJobsByMember", {hideAfter: 4})
    //         })
    //     }
    // },[selectedCrew, crewJobs])

    const handleSelectCrew =(event,crew)=>{
        if(!crew){
            console.error("Couldn't Select crew");
            cogoToast.error("Error selecting crew", {hideAfter: 4})
        }
        setMemberJobs(null);
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
                        setMemberJobs(null);
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
            setMemberJobs(null);
            
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
                            
                        {crew.names.map((name,i)=> ( <span>{name}{ (crew.names.length != i+1) ? <>,&nbsp;</> : <></> }</span>))}
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

