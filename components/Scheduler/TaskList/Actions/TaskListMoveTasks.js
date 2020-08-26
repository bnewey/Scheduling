import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, InputLabel, MenuItem} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import TaskLists from '../../../../js/TaskLists';
import { TaskContext } from '../../TaskContainer';
import cogoToast from 'cogo-toast';


const TaskListActionAdd = (props) => {
 
    //PROPS
    const { selectedTasks, setSelectedTasks, setTaskListTasks} = props;
    const {taskLists, setTaskLists, taskListToMap, setTaskListToMap } = useContext(TaskContext);

    //STATE
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedTaskList, setSelectedTaskList] = React.useState(null);

    //CSS
    const classes = useStyles();

    //FUNCTIONS

    const handleMoveDialogOpen = (event) => {
        setDialogOpen(true);   
    };

    const handleDialogClose = () => {
        setSelectedTaskList(null);
        setDialogOpen(false);
    };    

    const handleMoveItems = (event, selectedTasks) =>{
        if(!selectedTasks || selectedTasks.length == 0 || !selectedTaskList || !taskListToMap){
            console.error("Failed to handleMoveItems, bad params")
            cogoToast.error("Failed to move items");
            return;
        }

        TaskLists.addMultipleTasksToList(selectedTasks, selectedTaskList.id)
        .then((response)=>{
            if(response){
                TaskLists.removeMultipleFromList(selectedTasks, taskListToMap.id)
                .then((data)=>{
                    if(data){
                        cogoToast.success("Successfully moved tasks");
                        setSelectedTasks([]);
                        handleDialogClose()
                        setTaskListTasks(null);
                    }
                })
                .catch((error)=>{
                    cogoToast.error("Failed to remove multiple items");
                    console.error("Failed to remove multiple items", error);
                })
            }
        })
        .catch((error)=>{
            cogoToast.error("Failed to add multiple items")
            console.error("Failed to add multiple items", error)
        })
        
    };

    const handleChangeSelectedTaskList = event => {
        if(event.target.value === null){
            console.warn("Bad tl in handleChangeSelectedTaskLIst")
            return;
        }
        setSelectedTaskList(event.target.value);
    };


    
    return(
        <React.Fragment>
            <div className={classes.singleLineDiv}>
                            <span
                                className={classes.text_button} 
                                onClick={event => handleMoveDialogOpen(event)}>
                                Move Selected Tasks to List
                            </span>
            </div>
            
            { dialogOpen && taskListToMap && taskLists ? 
            
            <Dialog PaperProps={{className: classes.dialog}} open={handleMoveDialogOpen} onClose={handleDialogClose}>
            <DialogTitle className={classes.title}>Move Items</DialogTitle>
                <DialogContent className={classes.content}>
                        <FormControl variant="outlined" className={classes.inputField}>
                            <InputLabel id="task-list-label">
                            Select TaskList to move items
                            </InputLabel>
                            <Select
                            labelId="task-list-label"
                            id="task-list-input"
                            onChange={handleChangeSelectedTaskList}
                            value={selectedTaskList}
                            >
                            <MenuItem value={null}>Choose a Task List..</MenuItem>
                            {taskLists.filter((v)=>v.id != taskListToMap.id).map((list,i)=> (
                                <MenuItem value={list} key={"task-List-"+i}>{list.list_name}</MenuItem>))                    
                            }   
                            </Select>
                        </FormControl>
            <DialogActions>
                <Button onMouseDown={handleDialogClose} color="primary">
                    Cancel
                </Button>
                 <Button
                    onMouseDown={event => handleMoveItems(event, selectedTasks, selectedTaskList)}
                    variant="contained"
                    color="secondary"
                    size="medium"
                    className={classes.saveButton} >
                    Move
                    </Button>
                    
             </DialogActions> 
            </DialogContent>
            </Dialog>
            :<></>}
        </React.Fragment>
      
    );

} 

export default TaskListActionAdd;

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
    lightButton:{
        backgroundColor: '#b7c3cd',
        fontWeight: '600',
        "&& .MuiButton-startIcon":{
            margin: '0px 5px',
        }
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
        margin: '10px 17px ',
        padding: '9px 5px',
        backgroundColor: '#f3f4f6',
        borderRadius: '3px',
        display: 'block',
        '&& input':{
            color: '#16233b',
            minWidth: '292px',
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
    textField:{
        display: 'block',
        minWidth: '220px',
    },
    darkButton:{
        backgroundColor: '#fca437',
        color: '#fff',
        fontWeight: '600',
        border: '1px solid rgb(255, 237, 196)',
        fontSize: '9px',
        padding:'1%',
      '&:hover':{
        border: '',
        backgroundColor: '#ffedc4',
        color: '#d87b04'
      },
    },
    icon_small:{
        verticalAlign: 'text-bottom'
    },
    singleLineDiv:{
        display: 'block',
    },
    text_button:{
        cursor: 'pointer',
        fontSize: '12px',
        color: '#677fb3',
        margin: '0% 3% 0% 0%',
        '&:hover':{
            color: '#697fb1',
            textDecoration: 'underline',
        }
    },
  }));
