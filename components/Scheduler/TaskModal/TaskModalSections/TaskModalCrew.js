import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Select, IconButton, ButtonGroup, Button, FormControl, MenuItem, InputLabel, Paper,
    Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import XIcon from '@material-ui/icons/Remove';
import cogoToast from 'cogo-toast';
import { Scrollbars} from 'react-custom-scrollbars';
import {CrewContext} from '../../Crew/CrewContextContainer';

import Crew from '../../../../js/Crew';
import TaskListAddCrewDialog from '../../TaskList/TaskListAddCrewDialog';

export default function TaskModalCrew(props){
    const classes = useStyles();

    const { modalTask,  modalOpen, setModalOpen, setShouldReFetch, setTaskLists} = props;
    const {crewMembers, setCrewMembers, allCrewJobs, setAllCrewJobs, 
        setShouldResetCrewState, setMemberJobs} = useContext(CrewContext);

    const [modalCrewJobs, setModalCrewJobs] = useState(null);

    useEffect(()=>{
        if(modalCrewJobs == null && modalTask){
            Crew.getCrewJobsByTask(modalTask.t_id)
            .then((data)=>{
                if(data){
                    setModalCrewJobs(data);
                }
                console.log("ModalCrewJob to ", data);
            })
            .catch((error)=>{
                if(error){
                    console.error(error);
                    cogoToast.error("Could not get ModalCrewJobs")
                }
            })
        }
    },[modalOpen, modalCrewJobs]);
    
    const handleTaskListInputChange = event => {
        if(event.target.value === ''){
            return;
        }
        setTaskListToAdd(event.target.value);
      };

    const handleOpenAddToTaskListDialog = event => {
        setOpen(true);
    }

    const handleCloseAddToTaskListDialog = () => {
        
        setOpen(false);
    };

    const handleRemoveCrewMemberFromTask = (event, task_id, j_id, c_id) =>{
        if(task_id == null || j_id == null){
            cogoToast.error("Couldn't remove");
            console.error("Taskid or j_id is null in remove crew member")
        }
        Crew.deleteCrewJob(j_id, c_id)
        .then((response)=>{
            setShouldResetCrewState(true);
            setModalCrewJobs(null);
            cogoToast.success("Removed member with id", j_id);
        })
        .catch((error)=>{
            console.error("Failed to remove member", error);
            cogoToast.error("failed to remove member");
        })

    }



    return(
        
        <Paper className={classes.paper} style={ modalCrewJobs ? modalCrewJobs.length > 0 ? {backgroundColor: '#ececec'} : {backgroundColor: 'rgb(252, 239, 237)'} : {backgroundColor: 'rgb(252, 239, 237)'} }>
            <p className={classes.headingText}>Crew</p>
            { modalCrewJobs
            ? //ADDED TO TASK LIST ALREADY
                <>
                 <Scrollbars universal autoHeight autoHeightMax={100}>
                {modalCrewJobs.map((job) => ( 
                    <div className={classes.task_list_div}>
                        <span className={classes.p_task_name}>{job.member_name ? job.member_name : `Crew ${job.crew_id}`} - ({job.job_type})</span>
                        <span>{job.completed == 1 ? `Completed ${job.completed_date ? job.completed_date : ''}` : ""}</span>
                        <a  className={classes.remove_link}
                            onClick={event => handleRemoveCrewMemberFromTask(event, modalTask.t_id, job.id, job.crew_id)}>
                            Remove
                        </a> 
                    </div>
                ))}
                
                </Scrollbars>
                <TaskListAddCrewDialog selectedTasks={[modalTask.t_id]}  onClose={()=>{setShouldReFetch(true); setTaskLists(null)}}/>
                </>
            : <></>
            } 
        </Paper>

    );
}

const useStyles = makeStyles(theme => ({
    root:{

    },
    headingText:{
        fontSize: '19px',
        color: '#414d5a',
        fontWeight: '600',
        marginBlockStart: '0px',
        marginBlockEnd: '0px',
    },
    inputField: {
        margin: '10px 17px 7px 17px',
        padding: '0px',
        display: 'flex',
        '&& input':{
            padding: '12px 0px 12px 15px',
        },
        '&& .MuiSelect-select':{
            padding: '12px 40px 12px 15px',
            minWidth: '120px',
            color: '#414d5a',
        },
        '&& .MuiOutlinedInput-multiline': {
            padding: '8.5px 12px'
        },
        '&& label':{
            backgroundColor: 'rgba(0, 0, 0, .00)',
        }
    },
    paper:{
        margin: '16px 5px',
        padding: '8px 4px',
        boxShadow: 'inset 0px 2px 1px -1px rgba(0,0,0,0.2), inset 0px 1px 1px 0px rgba(0,0,0,0.14), inset 0px 1px 3px 0px rgba(0,0,0,0.12)'
    },
    task_list_div:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignContent: 'center',
        backgroundColor: '#f3fbff',
        border: '1px solid #bfbfbf',
        padding: '0 1%',
    },
    p_task_name:{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        margin: '1em',
    },
    p_task_priority:{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        margin: '1em',
        color: '#a92b03',
        fontWeight: '600',
    },
    remove_link:{
        color: '#414d5a',
        margin: '1em',
        textDecoration: 'underline',
        '&:hover':{
            backgroundColor: '#cdcaca',
            borderRadius: '3px',
            cursor: 'pointer',
        }
    },
    add_link_div:{
        paddingTop: '3%'
    },
    dialog:{
        
    },
    title:{
        '&& .MuiTypography-root':{
            fontSize: '22px',
            color: '#fff',
        },
        
        backgroundColor: '#16233b',

    },
    content:{
        minWidth: '500px',
    },
  }));