import React, {useRef, useState, useEffect} from 'react';

import {makeStyles, Select, ButtonGroup, Button, FormControl, MenuItem, InputLabel, Paper} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import cogoToast from 'cogo-toast';

import TaskLists from '../../../../js/TaskLists';

export default function TaskModalTaskList(props){
    const classes = useStyles();

    const {taskLists, setTaskLists, modalTask, setShouldReFetch, modalOpen, setModalOpen, setModalTaskId} = props;
    const [taskListToAdd, setTaskListToAdd] = useState(null);
    
    const handleTaskListInputChange = event => {
        if(event.target.value === ''){
            return;
        }
        setTaskListToAdd(event.target.value);
      };

    const getTaskListName = (id) =>{
        if(!taskLists || !id){
            return "Error";
        }
        var tl = taskLists.filter((list, i)=> list.id === id)[0];
        if(!tl){
            return "Error";
        }
        return tl.list_name;
    }

   const handleAddToTaskList = (event, id, tl_id) => {
       if(!taskListToAdd){
           return;
       }
        var task_ids = taskLists.map((task, i)=> task["t_id"]);

        TaskLists.reorderTaskList(task_ids, tl_id)
        .then( (ok) => {      
            if(!ok)
                console.warn("Failed to Reorder before Adding to TaskList");
                
            TaskLists.addTaskToList(id, taskListToAdd)
                .then( (ok) => {
                    //we need to refetch modalTask
                    if(!ok)
                        throw new Error("Failed to add Task to TaskList");
                    cogoToast.success(`Task ${id} added to Task List ${taskListToAdd} `);
                    setShouldReFetch(true);
                })
                .catch(error => {
                    console.error(error);
                    cogoToast.error(`Error adding to task list.`);
                }) 
        })
        .catch(error => {
            console.error(error);
        })   
    }

    const handleRemoveTaskFromList = (event, id, tl_id) => {
        TaskLists.removeTaskFromList(id, tl_id)
        .then( (ok)=> {
            if(!ok){
                throw new Error("Failed to remove Task: " + id + " from Task List :" + tl_id);
            }
            cogoToast.success(`Removed task ${id} from task list ${tl_id}`);
            setTaskLists(null);
            setShouldReFetch(true);
            
        })
        .catch(error =>{
            console.error(error);
            cogoToast.error("Error removing task from task list");
        })
    }

    return(
        
        <Paper className={classes.paper} style={modalTask.task_list_id ? {backgroundColor: '#ececec'} : {backgroundColor: 'rgb(252, 239, 237)'}}>
            <p className={classes.headingText}>Task List</p>
            { modalTask.task_list_id && modalTask.priority_order
            ? //ADDED TO TASK LIST ALREADY
                <div>
                    <p className={classes.p_task_name}>{getTaskListName(modalTask.task_list_id)} | Priority Order: {modalTask.priority_order}</p>
                    <Button
                        onClick={event => handleRemoveTaskFromList(event, modalTask.t_id, modalTask.task_list_id)}
                        variant="contained"
                        color="secondary"
                        size="medium"
                        className={classes.saveButton}
                    >
                    Remove from TaskList
                    </Button>
                </div>
            : //NOT ADDED TO A TASK LIST
                <div><FormControl variant="outlined" className={classes.inputField}>
                    <InputLabel id="task-list-label">
                    Add to Task List
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
                        onClick={event => handleAddToTaskList(event, modalTask.t_id, 1)}
                        variant="contained"
                        color="secondary"
                        size="medium"
                        className={classes.saveButton}
                    >
                       <AddIcon />Add To TaskList
                        </Button>
                   :<div><p style={{color: 'rgba(0, 0, 0, 0.52)'}}>Select a Task List</p></div> }   
                </FormControl> 
                </div>
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
        marginBlockStart: '10px',
        marginBlockEnd: '0px',
    },
    saveButton:{
        backgroundColor: '#414d5a',
        color: '#fff'
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
    p_task_name:{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }
  }));