import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Paper, Grid, List, ListItem, ListSubheader, ListItemText, ListItemSecondaryAction, IconButton, Popover, Checkbox, Button,
    Collapse } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
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



const CrewCrewsCrews = (props) => {

    const {selectedCrew, setSelectedCrew, crewJobs, setCrewJobs, selectedCrewMembers, setSelectedCrewMembers, selectedJob, setSelectedJob} = props;
    const {setModalTaskId, setModalOpen} = useContext(TaskContext);

    const { crewMembers,setCrewMembers, allCrewJobs, allCrews, setAllCrews,
        setAllCrewJobs, allCrewJobMembers, setAllCrewJobMembers, setShouldResetCrewState} = useContext(CrewContext);

    const classes = useStyles();

    //Popover Add member to crew
    const [addMemberAnchorEl, setAddMemberAnchorEl] = React.useState(null);
    const [addMemberCrewId, setAddMemberCrewId] = useState(null);
    

    const handleSelectCrew =(event,crew)=>{
        if(!crew){
            console.error("Couldn't Select crew");
            cogoToast.error("Error selecting crew", {hideAfter: 4})
        }
        if(selectedCrew  && crew.id == selectedCrew.id){
            setSelectedCrew(null);
            return;
        }
        setCrewJobs(null);
        setSelectedCrewMembers(null);
        setSelectedCrew(crew);
    }


    //Swap Popover for crews
    const handleOpenAddMemberPopover = (event, crew) =>{
        setAddMemberAnchorEl(event.currentTarget);
        setAddMemberCrewId(crew.id);
    }
    const handleAddMemberPopoverClose = () => {
        setAddMemberAnchorEl(null);
        setAddMemberCrewId(null);
    };


    //Swap Crews  
    const addMemberPopoverOpen = Boolean(addMemberAnchorEl);
    const addMemberPopoverId = open ? 'add-popover' : undefined;

    const handleAddCrewMember = (event, member, isLeader) => {
        if(!member.id || !addMemberCrewId){
            cogoToast.error("Could not add Member.");
            console.error("Bad member or addMemberCrewId for addmember.");
            return;
        }
        Crew.addNewCrewJobMember(member.id, addMemberCrewId,  isLeader)
        .then((data)=>{
            setShouldResetCrewState(true);
            setSelectedCrewMembers(null);
            setSelectedCrew({...selectedCrew});
            cogoToast.success("Added member to crew");
        })
        .catch((error)=>{
            console.error(error);
            cogoToast.error("Failed to add crews");
        });
        if(addMemberPopoverOpen){
            handleAddMemberPopoverClose();
        }
    }

    const handleDeleteCrew = (event, crew_id) => {
        if(isNaN(crew_id)){
            console.error("Bad crew_id");
            cogoToast.error("Failed to delete crew");
            return;
        }
        const deleteCrew = () => {
            Crew.deleteCrew(crew_id)
            .then((response)=>{
                if(response){
                    cogoToast.success("Deleted Crew");
                    setAllCrews(null);
                    setAllCrewJobs(null);
                    setCrewJobs(null);
                    setShouldResetCrewState(true);
                }
            })
            .catch((error)=>{
                if(error){
                    cogoToast.error("Failed to delete Crew");
                    console.error("Failed to delete crew", error);
                }
            })
        }

        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={deleteCrew} onClose={onClose} customMessage={"Delete Crew permanently?"}/>
                );
            }
        })

    }

    const handleDeleteMemberFromCrew = (event, m_id, crew_id) => {
        if(isNaN(m_id) || isNaN(crew_id)){
            console.error("Bad m_id or crew_id in handleDeleteMemberFromCrew", error);
            cogoToast.error("Failed to delete member");
            return;
        }

        Crew.deleteCrewJobMember(m_id, crew_id)
        .then((data)=>{
            if(data){
                cogoToast.success("Deleted crew member from crew");
                setShouldResetCrewState(true);
                setSelectedCrewMembers(null);
                setSelectedCrew({...selectedCrew});
            }
        })
        .catch((error)=>{
            if(error){
                cogoToast.error("Failed to delete crew member");
                console.error("Failed to delete member", error);
            }
        })

    }

    const handleAddCrew = () => {
        Crew.addNewCrew()
        .then((data)=>{
            if(!isNaN(data)){
                setShouldResetCrewState(true);
            }
        })
        .catch((error)=>{
            console.error("handleAddOrCreateCrew", error);
            cogoToast.error("Failed to Create and Add to Crew");
        })
    }

    return(
        <>
                <List 
                    className={classes.memberList}
                    subheader={
                        <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                            Crews
                        </ListSubheader>
                    }>
                    {allCrews && allCrews.map((crew, i)=>{
                        return(
                            <div className={classes.member_list_item_div}>
                            <ListItem className={selectedCrew == crew ? classes.member_select_list_item : classes.member_list_item}
                                key={`crews+${i}`} button
                                onMouseUp={(event) => handleSelectCrew(event, crew)}>
                                
                                <ListItemText disableTypography className={classes.crew_text}>

                                    <span className={classes.leaderSpan}>{crew && crew.crew_leader_name ? crew.crew_leader_name : 'Crew ' + crew.id}</span>
                                    <div className={classes.otherMemberDiv}>
                                        <span className={classes.otherMemberHeadSpan}>
                                            Other Members:
                                        </span>
                                        <span className={classes.otherMemberSpan}>{allCrewJobMembers && allCrewJobMembers
                                        .filter((mj, i) => mj.crew_id == crew.id)
                                        .map((job) => job.member_name == crew.crew_leader_name ? false : job.member_name + ", ")}
                                        </span>
                                    </div>

                                    <span className={classes.jobCountSpan}>({allCrewJobs ? allCrewJobs.filter((item, i) => item.crew_id == crew.id).length : 0}&nbsp;Jobs)</span>

                                    <IconButton className={classes.secondary_button} onClick={event => handleOpenAddMemberPopover(event, crew)} >
                                        <PersonAddIcon edge="end" aria-label="add" />
                                    </IconButton>

                                    <IconButton className={classes.secondary_button} edge="end" aria-label="delete" onClick={event => handleDeleteCrew(event, crew.id)}>
                                        <DeleteIcon />
                                    </IconButton> 
                            </ListItemText>
                            
                        </ListItem>
                        <Collapse in={selectedCrew ? selectedCrew.id == crew.id : false} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding className={classes.crewMemberList}>
                                {selectedCrewMembers && selectedCrewMembers.map((member)=>{
                                    return (
                                        <ListItem button key={crew.id+member.id} className={classes.crewMemberListItem}>
                                            <ListItemText disableTypography className={classes.crew_member_text}>
                                                <span className={classes.crewMemberLeaderSpan}>{member.is_leader ? "Leader" : ""}</span>
                                                <span className={classes.crewMemberNameSpan}>{member.member_name}</span>
                                                <IconButton className={classes.secondary_small_button} edge="end" aria-label="delete" onClick={event => handleDeleteMemberFromCrew(event, member.id, crew.id)}>
                                                    <DeleteIcon />
                                                </IconButton> 
                                            </ListItemText>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Collapse>
                        </div>
                    )})}
                    <Button className={classes.openButton} onClick={event => handleAddCrew()}>Add New Crew</Button>
                </List>
                
             <Popover
                id={addMemberPopoverId}
                open={addMemberPopoverOpen}
                anchorEl={addMemberAnchorEl}
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
                <List 
                    subheader={
                        <ListSubheader className={classes.list_head} component="div" id="nested-list-subheader">
                            Add Member
                        </ListSubheader>
                    }>
                    {allCrewJobMembers && addMemberCrewId && crewMembers && crewMembers.filter((fil_mem, i)=>{
                            //Get members not in crew
                            var tmp =   allCrewJobMembers.filter((mj, i) => mj.crew_id == addMemberCrewId).every((m) =>(
                                !(fil_mem.id == m.ma_id)
                            ))
                            return(tmp)}
                        ).map((member, i)=>(
                            <ListItem className={classes.member_list_item} 
                                        key={`crew_members+${i}`} button
                                        onMouseUp={(event)=>handleAddCrewMember(event, member, selectedCrewMembers.length == 0 ? 1 : 0)}>
                                <ListItemText primary={member.member_name} />
                            </ListItem>
                        ))}
                </List>
            </Popover> 
        </>
    );
};

export default CrewCrewsCrews;


const useStyles = makeStyles(theme => ({

    list_head:{
        lineHeight: '24px',
        borderRadius: '5px',
        color: '#dddddd'
    },
    crewMemberList:{
        width: '100%',
        backgroundColor: '#dedede',
        borderRadius: '5px',
        maxHeight: '500px',
        overflowY: 'auto',
    },
    member_list_item_div:{
        border: '1px solid #fff',
    },
    crewMemberListItem:{
        border: '1px solid #a9c6c4',
        padding: '.5% 10%',
        backgroundColor: '#fbfbfb',
        '&:hover':{
            backgroundColor: '#e4feff',
        },
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
        padding: '0% 5%',
        border: '1px solid #777777'
    },
    member_select_list_item:{
        backgroundColor: '#ffa93e',
        '&:hover':{
            backgroundColor: '#e18a1e',
            color: '#404654',
        },
        padding: '0% 5%',
        border: '2px solid #666666'
    },
    secondary_div:{
        display: 'flex',
    },
    secondary_button:{
        flexBasis: '5%',
        padding: '5px',
        margin: '1%'
    },
    crewMemberLeaderSpan:{
        flexBasis: '10%',
        minWidth: '15px',
        color: '#676767',
        fontVariant: 'all-petite-caps',
        fontWeight: '600',
    },
    crewMemberNameSpan:{
        flexBasis: '80%',
        color: '#0c6b67',
        fontSize: 'medium',
    },
    secondary_small_button:{
        padding: '5px',
    },
    popover:{

    },
    popoverPaper:{
        width: '146px',
        borderRadius: '10px',
        backgroundColor: '#6f6f6f',
    },
    crew_text:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        whiteSpace: 'nowrap',
    },
    crew_member_text:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        margin: '0px',
    },
    leaderSpan:{
        fontWeight: '700',
        color: '#333',
        fontSize: '1em',
        flexBasis: '20%',
    },
    otherMemberDiv:{
        flexBasis:'50%',
        display: 'flex',
        flexDirection: 'column',
    },
    otherMemberHeadSpan:{
        color: '#9a4f00',
        fontVariant: 'all-petite-caps',
    },
    otherMemberSpan:{
        fontWeight: '500',
        fontSize: '.8em',
        color: '#555',
    },
    jobCountSpan:{
        fontSize: '1em',
        color: '#004464',
        fontWeight: '700',
        flexBasis: '7%'
    },
    openButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        margin: '10px 30px',
        fontWeight: '700',
        fontSize: '13px',
        padding: '0px 16px',
        '&:hover':{
            border: '',
            backgroundColor: '#ffedc4',
            color: '#d87b04'
        }
    },
    
  }));

