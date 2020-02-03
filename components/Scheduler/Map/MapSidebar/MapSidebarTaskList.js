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
    const [taskListToMap, setTaskListToMap] = useState(null);
    const [open, setOpen] = React.useState(false);
    //PROPS
    const {mapRows, setMapRows, taskLists, setTaskLists, setActiveMarker, setResetBounds, setSelectedIds} = props;


    //CSS
    const classes = useStyles();

    //FUNCTIONS
    const handleChangeTaskListToMap = (event) => {
        var id = event.target.value;
        var task = taskLists.filter((list, i)=> list.id === id)[0];
        setTaskListToMap(task);
    };
    const handleMapTaskList = (event) => {
        //fetch TaskListTasks
        TaskLists.getTaskList(taskListToMap.id)
            .then( (data) => {
                //Reset selected ids to prevent confusing on Tasks Table
                setSelectedIds([]);
                setMapRows(data);
                //Zoom out to focus on new task list
                setResetBounds(true);
                handleClose();
            })
            .catch( error => {
            console.error(error);
        })        
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
                value={taskListToMap ? taskListToMap.id : null}
                onChange={handleChangeTaskListToMap}
                >
                    <MenuItem value={null}></MenuItem>
                {taskLists.map((list,i)=> (
                    <MenuItem value={list.id}>{list.list_name}</MenuItem>))                    
                }
                </Select>
            </FormControl>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                {taskListToMap ? <Button
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