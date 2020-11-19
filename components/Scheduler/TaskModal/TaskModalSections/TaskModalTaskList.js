import React, {useRef, useState, useEffect} from 'react';

import {makeStyles, Select, IconButton, ButtonGroup, Button, FormControl, MenuItem, InputLabel, Paper,
    Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import XIcon from '@material-ui/icons/Remove';
import cogoToast from 'cogo-toast';
import { Scrollbars} from 'react-custom-scrollbars';

import TaskLists from '../../../../js/TaskLists';

export default function TaskModalTaskList(props){
    const classes = useStyles();

    const {taskLists, setTaskLists, modalTask, setShouldReFetch, modalOpen, setModalOpen, setModalTaskId} = props;
    const [taskListToAdd, setTaskListToAdd] = useState(null);
    const [relatedTaskLists, setRelatedTaskLists] = useState(null);
    const [open, setOpen] = React.useState(false);

    useEffect(()=>{
        if(relatedTaskLists == null && modalOpen){
            TaskLists.getAllTaskListPerTask(modalTask.t_id)
            .then((data)=>{
                if(data.length > 0){
                    setRelatedTaskLists(data);
                }
                console.log("TaskList to ", data);
            })
            .catch((error)=>{
                if(error){
                    console.error(error);
                    cogoToast.error("Could not get all related task lists")
                }
            })
        }
    },[modalOpen]);
    
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


   const handleAddToTaskList = (event, id, tl_id) => {
       if(tl_id == undefined){
           return;
       }
        
         // set to null on purpose
        TaskLists.getTaskList(tl_id)
        .then( (data)=>{
            if(!data){
                throw new Error("Bad data from getTaskList before Reorder");
            }
            var task_ids = data.map((item, i)=> item.t_id);
            TaskLists.reorderTaskList(task_ids, tl_id)
            .then( (ok) => {      
                if(!ok)
                    console.warn("Failed to Reorder before Adding to TaskList");
                    
                    TaskLists.moveTaskToList(id, tl_id)
                    .then( (data) => {
                        //we need to refetch modalTask
                        if(!data){
                            throw new Error("Failed to move Task to TaskList");
                        }
                        cogoToast.success(`Task ${id} added to Task List ${tl_id} `, {hideAfter: 4});
                        handleCloseAddToTaskListDialog();
                        setShouldReFetch(true);
                    })
                    .catch(error => {
                        console.error(error);
                        cogoToast.error(`Error adding to task list.`, {hideAfter: 4});
                    }) 

                
            })
            .catch(error => {
                console.error(error);
            })   
        })
        .catch((error)=>{
            console.error(error);
            cogoToast.error("Failed to fetch taskList before Reordering", {hideAfter: 4})
        })

        
    }

    const handleRemoveTaskFromList = (event, id, tl_id) => {
        TaskLists.removeTaskFromList(id, tl_id)
        .then( (ok)=> {
            if(!ok){
                throw new Error("Failed to remove Task: " + id + " from Task List :" + tl_id);
            }
            cogoToast.success(`Removed task ${id} from task list ${tl_id}`, {hideAfter: 4});

            TaskLists.getTaskList(tl_id)
            .then( (data)=>{
                if(!data){
                    setTaskLists(null);
                    setShouldReFetch(true);
                    throw new Error("Bad data from getTaskList before Reorder");
                }
                var task_ids = data.map((item, i)=> item.t_id);
                TaskLists.reorderTaskList(task_ids, tl_id)
                .then( (ok) => {      
                    if(!ok)
                        console.warn("Failed to Reorder before Adding to TaskList");
                    setTaskLists(null);
                    setShouldReFetch(true);
                })
                .catch((error)=>{
                    console.error(error);
                })
            })
        })
        .catch(error =>{
            console.error(error);
            cogoToast.error("Error removing task from task list", {hideAfter: 4});
        })
    }

    return(
        
        <Paper className={classes.paper} style={ relatedTaskLists ? relatedTaskLists.length > 0 ? {backgroundColor: '#ececec'} : {backgroundColor: 'rgb(252, 239, 237)'} : {backgroundColor: 'rgb(252, 239, 237)'} }>
            <p className={classes.headingText}>Task List</p>
            { relatedTaskLists
            ? //ADDED TO TASK LIST ALREADY
                <>
                 <Scrollbars universal autoHeight autoHeightMax={100}>
                {relatedTaskLists.map((tl) => ( 
                    <div className={classes.task_list_div}>{console.log(tl)}
                        <span className={classes.p_task_name}>{tl.tl_name}</span>
                        <span className={classes.p_task_priority}>{ tl.tl_is_priority ? "Priority List" : ""}</span>
                        {/* <a  className={classes.remove_link}
                            onClick={event => handleRemoveTaskFromList(event, modalTask.t_id, tl.tl_id)}>
                            Remove
                        </a>     */}
                    </div>
                ))}
                </Scrollbars>
                
                </>
            : <></>
            } 
                {  <div className={classes.add_link_div}>
                    <a className={classes.remove_link} onClick={event => handleOpenAddToTaskListDialog(event) /*handleAddToTaskList(event, modalTask.t_id , taskLists[0].id)*/}> Move to Task List </a>
                </div>}
                <div>
                    { open 
                    ? 
                        <Dialog PaperProps={{className: classes.dialog}} open={open} onClose={handleCloseAddToTaskListDialog}>
                            <DialogTitle className={classes.title}>Select a Task List move to</DialogTitle>
                            <DialogContent className={classes.content}>
                                <FormControl variant="outlined" className={classes.inputField}>
                                <InputLabel id="task-list-label">
                                Move to Task List
                                </InputLabel>
                                <Select
                                labelId="task-list-label"
                                id="task-list-input"
                                onChange={handleTaskListInputChange}
                                value={taskListToAdd}
                                >
                                <MenuItem value={''}>Choose a Task List..</MenuItem>
                                {taskLists.map((list,i)=> (
                                    <MenuItem value={list.id} key={"task-List-"+i}>{list.list_name}</MenuItem>))                    
                                }   
                                </Select>
                            </FormControl>
                            <FormControl style={{display: 'block'}}>
                                {taskListToAdd ? <Button
                                    onClick={event => handleAddToTaskList(event, modalTask.t_id, taskListToAdd)}
                                    variant="contained"
                                    color="secondary"
                                    size="medium"
                                    className={classes.saveButton}
                                >
                                    <AddIcon />Add To TaskList
                                        </Button>
                                : <div><p style={{color: 'rgba(0, 0, 0, 0.52)'}}>Select a Task List</p></div> 
                                }   
                            </FormControl> 
                            </DialogContent>
                        </Dialog> 
                    : <></>
                    }
                </div>
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
        marginBlockStart: '10px',
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