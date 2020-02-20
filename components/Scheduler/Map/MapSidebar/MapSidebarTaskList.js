import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, Paper, MenuItem, InputLabel, FormHelperText, FormControl, Select, Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';

import TaskLists from '../../../../js/TaskLists';
import cogoToast from 'cogo-toast';
import { TaskContext } from '../../Table/TaskContainer';


const MapSidebarTaskList = (props) => {
    //PROPS
    const { setActiveMarker, setResetBounds, reFetchTaskList, setReFetchTaskList} = props;
    const {mapRows, setMapRows, taskLists, setTaskLists, selectedIds, setSelectedIds, taskListToMap, setTaskListToMap} = useContext(TaskContext);
    //STATE  
    const [open, setOpen] = React.useState(false);
    const [tempTaskListToMap, setTempTaskListToMap] = useState(null);
    //CSS
    const classes = useStyles();

    useEffect( () =>{ //useEffect for inputText
        //Gets and sets tasks from Task List when theres a tasklistToMap and no selected from EnhancedTable
        if(taskListToMap) {
            TaskLists.getTaskList(taskListToMap.id)
            .then( (data) => {

                //Set selected ids to Task List Tasks to prevent confusing on Tasks Table
                var newSelectedIds = data.map((item, i )=> item.t_id );
                setSelectedIds(newSelectedIds);
                
                setMapRows(data);
                //Zoom out to focus on new task list
                setResetBounds(true);
                cogoToast.success(`Active Task List: ${taskListToMap.list_name}.`);
            })
            .catch( error => {
                console.error(error);
                cogoToast.error(`Error getting task list`);
            })        
            
        }

        return () => { //clean up
            if(taskListToMap){
                
            }
        }
        },[taskListToMap]);

    useEffect( () =>{ //useEffect for inputText
    //Gets and sets tasks from Task List when theres a tasklistToMap and a refetch is needed. 
    //ex when user selected same task list as taskListToMap or when we reorder
    console.log("Refetch use effect");
    if(reFetchTaskList && taskListToMap) {
        TaskLists.getTaskList(taskListToMap.id)
        .then( (data) => {
            //Set selected ids to Task List Tasks to prevent confusing on Tasks Table
            var newSelectedIds = data.map((item, i )=> item.t_id );
            setSelectedIds(newSelectedIds);
            
            setMapRows(data);
            //Zoom out to focus on new task list
            setResetBounds(true);
            setReFetchTaskList(false);
            cogoToast.success(`Active Task List: ${taskListToMap.list_name}.`);
        })
        .catch( error => {
            console.error(error);
            cogoToast.error(`Error getting task list`);
        })        
        
    }
    },[reFetchTaskList]);    


    //FUNCTIONS
    const handleChangeTaskListToMap = (event) => {
        //Handles select value in our select task list modal 
        //This function does not fetch any data just yet
        var id = event.target.value;
        if(id === ''){
            return;
        }
        var task = taskLists.filter((list, i)=> list.id === id)[0];
        setTempTaskListToMap(task);
    };
    const handleMapTaskList = (event) => {
        //Actually fetches data after clicking ok on modal
        setActiveMarker(null);
        //Remove any rows that are user selected in enhanced table
        setSelectedIds([]);
        //Fetch task list tasks
        if(taskListToMap === tempTaskListToMap){
            //Special case where we need to refetch that wont work in regular fetching workflow
            setReFetchTaskList(true);
            handleClose();
            return;
        }
        setTaskListToMap(tempTaskListToMap);
        handleClose();
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        
        setOpen(false);
    };
     
    return(
        <React.Fragment>
            <span>Sidebar</span> 
            <Button className={classes.openButton} onClick={handleClickOpen}>Map a Task List</Button>
            { open && taskLists ? 
            <Dialog PaperProps={{className: classes.dialog}} open={open} onClose={handleClose}>
                <DialogTitle className={classes.title}>Select a Task List to Map</DialogTitle>
                <DialogContent className={classes.content}>
            <FormControl className={classes.inputField}>
                <InputLabel id="task-list-select-label">Select A Task List</InputLabel>
                <Select
                labelId="task-list-select-label"
                id="task-list-select"
                value={tempTaskListToMap ? tempTaskListToMap.id : ''}
                onChange={handleChangeTaskListToMap}
                >
                    <MenuItem value={''}>Choose a Task List..</MenuItem>
                {taskLists.map((list,i)=> (
                    <MenuItem value={list.id} key={"task-list-"+i}>{list.list_name}</MenuItem>))                    
                }
                </Select>
            </FormControl>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                {tempTaskListToMap ? <Button
                    onClick={event => handleMapTaskList(event)}
                    variant="contained"
                    color="secondary"
                    size="medium"
                    className={classes.saveButton} >
                    Map TaskList
                    </Button>
                :<></> }   
             </DialogActions> 
            </DialogContent>
            </Dialog>
            :<></>}
            { taskListToMap ? <p className={classes.p_activeTask}>Active Task List: {taskListToMap.list_name}</p> 
                        : <><p className={classes.p_noActiveTask}>No Active Task List!</p></>}
        </React.Fragment>
      
    );

} 

export default MapSidebarTaskList;

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
        padding: '0px 16px',
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
    p_activeTask:{
        fontSize: '13px',
        fontWeight: '600',
        margin: '5px 17px',
        backgroundColor: '#2e92da',
        padding: '3px 25px',
        borderRadius: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0px 2px 1px -1px rgba(0,0,0,0.2), inset 0px 1px 1px 0px rgba(0,0,0,0.14), inset 0px 1px 3px 0px rgba(0,0,0,0.12)'
    },
    p_noActiveTask:{
        fontSize: '13px',
        fontWeight: '600',
        margin: '5px 17px',
        backgroundColor: '#7d7d7d',
        padding: '3px 25px',
        borderRadius: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0px 2px 1px -1px rgba(0,0,0,0.2), inset 0px 1px 1px 0px rgba(0,0,0,0.14), inset 0px 1px 3px 0px rgba(0,0,0,0.12)'
    }
  }));