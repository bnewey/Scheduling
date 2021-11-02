
import React, {useRef, useState, useEffect, useContext} from 'react';
import dynamic from 'next/dynamic';
import { lighten, makeStyles } from '@material-ui/core/styles';

import {Tooltip, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem} from '@material-ui/core';

import cogoToast from 'cogo-toast';

import TaskLists from '../../../js/TaskLists';

import {TaskContext} from '../TaskContainer';

function EnhancedTableAddTL(props) {
    //PROPS
    //const { numSelected, onRequestSort, rows } = props;
    const { selectedIds, taskLists, setTaskLists, priorityList, setTaskListToMap, user} = useContext(TaskContext);
    //STATE
    const [open, setOpen] = React.useState(false);
    const [taskListToAdd, setTaskListToAdd] = React.useState(null);

    //CSS
    const classes = useStyles();

    useEffect(()=>{
        if(taskLists && priorityList){
            setTaskListToAdd(priorityList);
        }
    },[taskLists]);



    const handleOpenAddTL = () => {
        if(selectedIds.length > 50) {
            cogoToast.warn(`Cannot add ${selectedIds.length} tasks. Try adding 50 or less tasks. `, {hideAfter: 4})
            return;
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const handleAddToTaskList = (event, tl_id) => {
        if(!tl_id){
            cogoToast.error("No task list selected. Could not add");
            handleClose();
            return;
        }
        if(selectedIds.length > 50) {
            cogoToast.warn(`Cannot add ${selectedIds.length} tasks. Try adding 50 or less tasks`, {hideAfter: 4});
            handleClose();
            return;
        }
        //add multiple to task list 
        TaskLists.addMultipleTasksToList(selectedIds, tl_id, user)
        .then((response)=> {
            if(!response){
                throw new Error("Bad response from addMultipleTasksToList call");
            }
            //Default to priority list after save
            setTaskListToMap(priorityList);
            cogoToast.success(`${selectedIds.length} tasks added to Task List`, {hideAfter: 4});
        })
        .catch(error => {
            console.warn(error);
        })
        handleClose();
    };
  
    return (
        <React.Fragment>
        <Tooltip title="Add selected tasks to task list."
                        arrow={true} enterDelay={400} placement={'top'}
                        classes={{tooltip: classes.tooltip }}>
        <Button
            onClick={event => handleOpenAddTL(event)}
            variant="text"
            color="secondary"
            size="medium"
            className={classes.openButton} >
            Add To TaskList
        </Button>
        </Tooltip>
         
        <Dialog  PaperProps={{className: classes.dialog}} open={open} onClose={handleClose}>
            <DialogTitle className={classes.title}>Confirm Add</DialogTitle>
            <DialogContent className={classes.content}>
            <p>Choose Add add selected tasks to task list. Duplicates will be ignored.</p>
            
            
        <DialogActions>
            <Button onClick={handleClose} color="primary">
                Cancel
            </Button>
            <Button
                onClick={event => handleAddToTaskList(event, taskListToAdd?.id ?? null)}
                variant="contained"
                color="secondary"
                size="medium"
                className={classes.saveButton} >
                Add
            </Button>  
            {/* <Button
                onClick={event => handleCreateTaskList(event)}
                variant="contained"
                color="secondary"
                size="medium"
                className={classes.saveButton} >
                Create New
            </Button>  */}
        </DialogActions> 
        </DialogContent>
        </Dialog>
        </React.Fragment>
    );
 }

 export default EnhancedTableAddTL;

 const useStyles = makeStyles(theme => ({
    root: {

    },
    dialog:{
        
    },
    title:{
        '&& .MuiTypography-root':{
            fontSize: '15px',
            color: '#fff',
        },
        padding: '5px 13px',
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
        backgroundColor: '#558fbc',
        color: '#fff',
        margin: '0px 30px',
        fontWeight: '700',
        fontSize: '13px',
        padding: '0px 16px',
        '&:hover':{
            border: '',
            backgroundColor: '#03a9f4',
            color: '#ececec'
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