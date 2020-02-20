
import React, {useRef, useState, useEffect, useContext} from 'react';
import dynamic from 'next/dynamic';
import { lighten, makeStyles } from '@material-ui/core/styles';

import {Tooltip, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem} from '@material-ui/core';

import cogoToast from 'cogo-toast';

import TaskLists from '../../../js/TaskLists';

import {TaskContext} from './TaskContainer';

function EnhancedTableAddCreateTL(props) {
    //PROPS
    const { numSelected, onRequestSort, rows } = props;
    const { selectedIds, taskLists, setTaskLists} = useContext(TaskContext);
    //STATE
    const [open, setOpen] = React.useState(false);
    const [taskListToAdd, setTaskListToAdd] = React.useState(null);

    //CSS
    const classes = useStyles();


    // useEffect(() =>{ //useEffect for inputText
    
    //   return () => { //clean up
         
    //   }
    // },[]);

    const handleOpenAddCreateTL = () => {
        if(selectedIds.length > 50) {
            cogoToast.warn(`Cannot add ${selectedIds.length} tasks. Try adding 50 or less tasks. `)
            return;
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChangeTaskListToAdd = (event) => {
        var id = event.target.value;
        if(id === ''){
            return;
        }
        var task = taskLists.filter((list, i)=> list.id === id)[0];
        setTaskListToAdd(task);
    };

    const handleAddToTaskList = (event, tl_id) => {
        if(selectedIds.length > 50) {
            cogoToast.warn(`Cannot add ${selectedIds.length} tasks. Try adding 50 or less tasks`);
            handleClose();
            return;
        }
        //add multiple to task list 
        TaskLists.addMultipleTasksToList(selectedIds, tl_id)
        .then((response)=> {
            if(!response){
                throw new Error("Bad response from addMultipleTasksToList call");
            }
            cogoToast.success(`${selectedIds.length} tasks added to Task List`);
        })
        .catch(error => {
            console.warn(error);
        })
        handleClose();
    };

    const handleCreateTaskList = (event) => {
        //create a task list .then handleAddToTaskList(new id)
        TaskLists.addTaskList("New List")
                .then((id) => {
                    if(!id){
                        throw new Error("Bad id from addNewTaskList, Failed to add selected tasks to new task list");
                    }
                    //Add Selected ids to new list
                    handleAddToTaskList(event, id);
                    setTaskLists(null);
                })
                .catch( error => {
                    console.error(error);
            });
    };
  
    return (
        <React.Fragment>
        <Tooltip title="Add selected tasks to or create a new task list."
                        arrow={true} enterDelay={400} placement={'top'}
                        classes={{tooltip: classes.tooltip }}>
        <Button
            onClick={event => handleOpenAddCreateTL(event)}
            variant="text"
            color="secondary"
            size="medium"
            className={classes.openButton} >
            Add To/Create Task List
        </Button>
        </Tooltip>
         
        <Dialog  PaperProps={{className: classes.dialog}} open={open} onClose={handleClose}>
            <DialogTitle className={classes.title}>Add To/Create New Task List</DialogTitle>
            <DialogContent className={classes.content}>
            <p>Choose Add or Create New to add selected tasks to existing task list or create a new task list respectively. Duplicates will be ignored.</p>
            {taskLists ? 
            <FormControl className={classes.inputField}>
            
            <InputLabel id="task-list-select-label">Select A Task List</InputLabel>
            <Select
            labelId="task-list-select-label"
            id="task-list-select"
            value={taskListToAdd ? taskListToAdd.id : ''}
            onChange={handleChangeTaskListToAdd}
            >
                <MenuItem value={''}>Choose a Task List..</MenuItem>
            
             {taskLists.map((list,i)=> (
                <MenuItem value={list.id} key={"task-list-"+i}>{list.list_name}</MenuItem>))
             }                   
            
            </Select> 
            
        </FormControl>
        : <p>No task lists found, please create new.</p>}
        <DialogActions>
            <Button onClick={handleClose} color="primary">
                Cancel
            </Button>
            <Button
                onClick={event => handleAddToTaskList(event, taskListToAdd.id)}
                variant="contained"
                color="secondary"
                size="medium"
                className={classes.saveButton} >
                Add
            </Button>  
            <Button
                onClick={event => handleCreateTaskList(event)}
                variant="contained"
                color="secondary"
                size="medium"
                className={classes.saveButton} >
                Create New
            </Button> 
        </DialogActions> 
        </DialogContent>
        </Dialog>
        </React.Fragment>
    );
 }

 export default EnhancedTableAddCreateTL;

 const useStyles = makeStyles(theme => ({
    root: {

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
    saveButton:{
        backgroundColor: '#414d5a',
        color: '#fff'
    },
    openButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        margin: '0px 30px',
        fontWeight: '700',
        fontSize: '13px',
        padding: '3px 16px',
        '&:hover':{
            border: '',
            backgroundColor: '#ffedc4',
            color: '#d87b04'
        }
    },
    inputField: {
        margin: '10px 17px 40px 57px',
        padding: '9px 5px',
        backgroundColor: '#f3f4f6',
        borderRadius: '3px',
        display: 'flex',
        '&& input':{
            color: '#16233b',
        },
        '&& .MuiSelect-select':{
            minWidth: '292px',
            color: '#000',
            fontSize: '15px'
        },
        '&& .MuiOutlinedInput-multiline': {
        },
        '&& label':{
            backgroundColor: 'rgba(0, 0, 0, .00)',
            color: '#16233b',
            fontWeight: '500',
            fontSize: '14px'
        }
    },
  }));