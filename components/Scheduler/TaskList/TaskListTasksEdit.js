import React, {useRef, useState, useEffect, useContext} from 'react';

import {makeStyles, FormControl, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@material-ui/core';

import TaskLists from '../../../js/TaskLists';
import { TaskContext } from '../TaskContainer';



const TaskListTasksEdit = ({props}) => {
 
    //PROPS
    const { taskListToMap, list, open, handleClose} = props;
    const {taskLists, setTaskLists } = useContext(TaskContext);

    //STATE
    
    const [newListName, setNewListName] = React.useState(null);

    //CSS
    const classes = useStyles();

    //FUNCTIONS

    useEffect(() =>{ //useEffect for inputText
        if(list){
          setNewListName(list.list_name);
        }
      
        return () => { //clean up
     
        }
      },[list]);
  

    const handleEditTaskList = (event) => {
        const name = newListName;
        if(!name || name === list.list_name){
            handleClose();
            return;
        }
        const updatedList = {...list};
        updatedList["list_name"] = name;

        TaskLists.updateTaskList(updatedList)
        .then((ok)=>{
            if(ok){
                handleClose();
                setTaskLists(null);
            }
        })
        .catch((error)=> {
            console.log(error);
        });
    }


     
    return(
        <React.Fragment>

            
            { list && open && taskLists ? 
            //TODO stupid expanded thing clicks through this dialog box
            <Dialog PaperProps={{className: classes.dialog}} open={open} onClose={handleClose}>
            <DialogTitle className={classes.title}>Edit Name of {list.list_name}</DialogTitle>
                <DialogContent className={classes.content}>
            <FormControl className={classes.inputField}>
                <TextField id="task-list-edit-name" 
                            className={classes.textField}
                            label="Name"
                            value={newListName}
                            onChange={event => setNewListName(event.target.value)}/>
            </FormControl>
            <DialogActions>
                <Button onMouseDown={handleClose} color="primary">
                    Cancel
                </Button>
                 <Button
                    onMouseDown={event => handleEditTaskList(event)}
                    variant="contained"
                    color="secondary"
                    size="medium"
                    className={classes.saveButton} >
                    Save
                    </Button>
                    
             </DialogActions> 
            </DialogContent>
            </Dialog>
            :<></>}
        </React.Fragment>
      
    );

} 

export default TaskListTasksEdit;

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
    }
  }));
