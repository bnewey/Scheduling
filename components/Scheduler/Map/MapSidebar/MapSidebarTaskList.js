import React, {useRef, useState, useEffect} from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import { Scrollbars} from 'react-custom-scrollbars';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';


import TaskLists from '../../../../js/TaskLists';



const MapSidebarTaskList = (props) => {
    //STATE
    
    const [open, setOpen] = React.useState(false);
   
    const [tempTaskListToMap, setTempTaskListToMap] = useState(null);
    //PROPS
    const {mapRows, setMapRows, taskLists, setTaskLists, setActiveMarker, setResetBounds, selectedIds, setSelectedIds,
        taskListToMap, setTaskListToMap, reFetchTaskList, setReFetchTaskList} = props;

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
                })
                .catch( error => {
                    console.error(error);
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
                console.log("Refetching...");
                TaskLists.getTaskList(taskListToMap.id)
                .then( (data) => {
                    //Set selected ids to Task List Tasks to prevent confusing on Tasks Table
                    var newSelectedIds = data.map((item, i )=> item.t_id );
                    setSelectedIds(newSelectedIds);
                    
                    setMapRows(data);
                    //Zoom out to focus on new task list
                    setResetBounds(true);
                    setReFetchTaskList(false);
                })
                .catch( error => {
                    console.error(error);
                })        
              
            }
          },[reFetchTaskList]);
    
    //CSS
    const classes = useStyles();

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