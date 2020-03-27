import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import TaskLists from '../../../js/TaskLists';
import { TaskContext } from '../TaskContainer';
import cogoToast from 'cogo-toast';


const TaskListActionAdd = (props) => {
 
    //PROPS
    const { setIdToActivateOnRefreshTL } = props;
    const {taskLists, setTaskLists } = useContext(TaskContext);

    //STATE
    const [addOpen, setAddOpen] = React.useState(false);
    const [newListName, setNewListName] = React.useState("New TaskList");

    //CSS
    const classes = useStyles();

    //FUNCTIONS

    const handleAddClickOpen = (event) => {
        setAddOpen(true);   
    };

    const handleAddClose = () => {
        setNewListName(null);
        setAddOpen(false);
    };
  

      const handleAddNew = (event, name) =>{
          if(!name){
              return;
          }
        TaskLists.addTaskList(name)
                .then((id) => {
                    if(!id){
                        console.warn("Bad id returned from addNewTaskList");
                    }
                    //refetch tasklists
                    setTaskLists(null);
                    setIdToActivateOnRefreshTL(id);
                    handleAddClose();
                    cogoToast.success(`Added new Task List`, {hideAfter: 4});
                })
                .catch( error => {
                    cogoToast.error(`Error adding new task list`, {hideAfter: 4});
                    console.error(error);
            });
    };

    
    return(
        <React.Fragment>
            <Button         
                    onClick={event => handleAddClickOpen(event)}    
                    variant="text"
                    color="secondary"
                    size="large"
                    className={classes.darkButton}
            ><AddIcon className={classes.icon_small} fontSize="small"/><span>New TaskList</span></Button>
            
            { addOpen && taskLists ? 
            
            <Dialog PaperProps={{className: classes.dialog}} open={handleAddClickOpen} onClose={handleAddClose}>
            <DialogTitle className={classes.title}>Name of New TaskList</DialogTitle>
                <DialogContent className={classes.content}>
            <FormControl className={classes.inputField}>
                <TextField id="task-list-edit-name" 
                            className={classes.textField}
                            label="Name"
                            value={newListName}
                            onChange={event => setNewListName(event.target.value)}/>
            </FormControl>
            <DialogActions>
                <Button onMouseDown={handleAddClose} color="primary">
                    Cancel
                </Button>
                 <Button
                    onMouseDown={event => handleAddNew(event, newListName)}
                    variant="contained"
                    color="secondary"
                    size="medium"
                    className={classes.saveButton} >
                    Add
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
  }));
